<?php

namespace App\Controller;

use App\Entity\Project;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

#[Route('/api/projects', name: 'api_projects_')]
class ProjectController extends AbstractController
{
    // Listar todos los proyectos del usuario autenticado
    #[Route('', name: 'list', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function list(): JsonResponse
    {
        $user = $this->getUser();
        $projects = $user->getProjects();

        $data = [];
        foreach ($projects as $project) {
            $data[] = [
                'id' => $project->getId(),
                'title' => $project->getTitle(),
                'description' => $project->getDescription()
            ];
        }

        return $this->json($data);
    }

    // Crear un nuevo proyecto asociado al usuario autenticado
    #[Route('', name: 'create', methods: ['POST'])]
    #[IsGranted('ROLE_USER')]
    public function create(Request $request, EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        $data = json_decode($request->getContent(), true);
        $title = $data['title'] ?? null;
        $description = $data['description'] ?? null;

        if (!$title) {
            return $this->json(['error' => 'Title is required'], 400);
        }

        $project = new Project();
        $project->setTitle($title);
        $project->setDescription($description);
        $project->setUser($user);

        $em->persist($project);
        $em->flush();

        return $this->json([
            'message' => 'Project created',
            'id' => $project->getId()
        ], 201);
    }

    // Obtener todas las tareas asociadas a un proyecto concreto
    #[Route('/{id}/tasks', name: 'tasks', methods: ['GET'])]
    #[IsGranted('ROLE_USER')]
    public function getTasksByProject(Project $project): JsonResponse
    {
        // Verificamos que el proyecto pertenece al usuario autenticado
        $user = $this->getUser();
        if ($project->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        // Recogemos las tareas del proyecto
        $tasks = $project->getTasks();

        $data = [];
        foreach ($tasks as $task) {
            $data[] = [
                'id' => $task->getId(),
                'title' => $task->getTitle(),
                'completed' => $task->getCompleted(),
                'createdAt' => $task->getCreatedAt()?->setTimezone(new \DateTimeZone('Europe/Madrid'))->format('d/m/Y H:i')
            ];
        }

        return $this->json($data);
    }
}
