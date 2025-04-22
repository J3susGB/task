<?php

namespace App\Controller;

use App\Entity\Task;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

#[Route('/api/tasks')]
class TaskController extends AbstractController
{

    // Marcar todas las tareas como completadas
    #[Route('/complete-all', name: 'complete_all_tasks', methods: ['PUT'])]
    public function completeAllTasks(EntityManagerInterface $em): JsonResponse
    {
        // 1. Obtener todas las tareas
        $tasks = $em->getRepository(Task::class)->findAll();

        // 2. Marcar cada una como completada
        foreach ($tasks as $task) {
            $task->setCompleted(true);
        }

        // 3. Guardar los cambios en la base de datos
        $em->flush();

        // 4. Devolver todas las tareas actualizadas en formato JSON
        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);

        return $this->json($data);
    }

    // Listar todas las tareas ordenadas 
    #[Route('/ordered', name: 'ordered_tasks', methods: ['GET'])]
    public function ordered(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $order = strtoupper($request->query->get('order', 'ASC')); // Obtenemos el parámetro 'order' de la URL (?order=ASC o DESC)
        if (!in_array($order, ['ASC', 'DESC'])) {
            return $this->json(['error' => 'Invalid order value. Use ASC or DESC.'], 400);
        }

        $tasks = $em->getRepository(Task::class)->findAllOrderedById($order);

        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);

        return $this->json($data);
    }

    
    #[Route('', name: 'list_tasks', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $tasks = $em->getRepository(Task::class)->findAll();
        $data = array_map(fn($task) => [
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ], $tasks);
        return $this->json($data);
    }

    #[Route('', name: 'create_task', methods: ['POST'])]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $params = json_decode($request->getContent(), true);
        $task = new Task();
        $task->setTitle($params['title'] ?? 'Untitled');
        $task->setCompleted($params['completed'] ?? false);
        $em->persist($task);
        $em->flush();
        return $this->json([
            'id' => $task->getId(),
            'title' => $task->getTitle(),
            'completed' => $task->getCompleted(),
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
            'completed' => $task->getCompleted(),
            'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
        ]);
    }

}
