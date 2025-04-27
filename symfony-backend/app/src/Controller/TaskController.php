<?php

namespace App\Controller;

use App\Entity\Task;
use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/tasks')]
#[IsGranted('IS_AUTHENTICATED_FULLY')]
class TaskController extends AbstractController
{
    #[Route('/{projectId}/complete-all', name: 'complete_all_tasks', methods: ['PUT'])]
    public function completeAllTasks(int $projectId, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $project = $em->getRepository(Project::class)->find($projectId);

        if (!$project || $project->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $tasks = $em->getRepository(Task::class)->findBy(['project' => $project]);

        foreach ($tasks as $task) {
            $task->setCompleted(true);
        }

        $em->flush();

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);

        return $this->json($data);
    }

    #[Route('/{projectId}/ordered', name: 'ordered_tasks', methods: ['GET'])]
    public function ordered(int $projectId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $order = strtoupper($request->query->get('order', 'ASC'));
        if (!in_array($order, ['ASC', 'DESC'])) {
            return $this->json(['error' => 'Invalid order value. Use ASC or DESC.'], 400);
        }

        $user = $this->getUser();
        $project = $em->getRepository(Project::class)->find($projectId);

        if (!$project || $project->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $tasks = $em->getRepository(Task::class)->findByProjectOrderedById($project, $order);

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);

        return $this->json($data);
    }

    #[Route('/{projectId}', name: 'list_tasks', methods: ['GET'])]
    public function list(int $projectId, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $project = $em->getRepository(Project::class)->find($projectId);

        if (!$project || $project->getUser()->getId() !== $user->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $tasks = $em->getRepository(Task::class)->findBy(['project' => $project]);

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);

        return $this->json($data);
    }

    #[Route('/{projectId}', name: 'create_task', methods: ['POST'])]
    public function create(int $projectId, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();
        $project = $em->getRepository(Project::class)->find($projectId);

        if (!$project) {
            return $this->json(['error' => 'Project not found'], 404);
        }

        if ($project->getUser()->getId() !== $user->getId() && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json([
                'error' => 'Access denied',
                'reason' => 'You are neither the owner nor an admin',
                'projectOwnerId' => $project->getUser()->getId(),
                'loggedUserId' => $user->getId(),
                'isAdmin' => $this->isGranted('ROLE_ADMIN')
            ], 403);
        }

        $params = json_decode($request->getContent(), true);
        $task = new Task();
        $task->setTitle($params['title'] ?? 'Untitled');
        $task->setCompleted($params['completed'] ?? false);
        $task->setProject($project);
        $task->setUser($user);

        $em->persist($task);
        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ]);
    }

    #[Route('/{id}', name: 'delete_task', methods: ['DELETE'])]
    public function delete($id, EntityManagerInterface $em): JsonResponse
    {
        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        if ($task->getProject()->getUser()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $em->remove($task);
        $em->flush();

        return $this->json(['message' => 'Task deleted']);
    }

    #[Route('/{id}', name: 'update_task', methods: ['PUT'])]
    public function update($id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $task = $em->getRepository(Task::class)->find($id);

        if (!$task) {
            return $this->json(['error' => 'Task not found'], 404);
        }

        if ($task->getProject()->getUser()->getId() !== $this->getUser()->getId()) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $params = json_decode($request->getContent(), true);

        if (isset($params['title'])) {
            $task->setTitle($params['title']);
        }
        if (isset($params['completed'])) {
            $task->setCompleted($params['completed']);
        }

        $em->flush();

        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->isCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ]);
    }
}
