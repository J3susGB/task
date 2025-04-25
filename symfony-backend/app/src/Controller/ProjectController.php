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
#[IsGranted('ROLE_USER')] // Protege todo el controlador para usuarios autenticados
class ProjectController extends AbstractController
{
    // Listar todos los proyectos del usuario autenticado
    #[Route('', name: 'list', methods: ['GET'])]
    public function list(EntityManagerInterface $em): JsonResponse
    {
        $user = $this->getUser();

        // Si eres admin, ves todos los proyectos
        if ($this->isGranted('ROLE_ADMIN')) {
            $projects = $em->getRepository(Project::class)->findAll();
        } else {
            // Si eres usuario normal, solo tus proyectos
            $projects = $user->getProjects();
        }

        $data = [];
        foreach ($projects as $project) {
            $data[] = [
                'id' => $project->getId(),
                'title' => $project->getTitle(),
                'description' => $project->getDescription(),
                'user' => $project->getUser()->getEmail()
            ];
        }

        return $this->json($data);
    }


    // Crear un nuevo proyecto asociado al usuario autenticado
    #[Route('', name: 'create', methods: ['POST'])]
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
    public function getTasksByProject(Project $project): JsonResponse
    {
        $user = $this->getUser();

        // Verificamos que el proyecto pertenece al usuario autenticado
        if ($project->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], 403);
        }

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

    /**
     * Actualizar un proyecto (solo si pertenece al usuario autenticado)
     */
    #[Route('/{id}', name: 'update', methods: ['PUT'])]
    public function updateProject(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $project = $em->getRepository(Project::class)->find($id);
        $user = $this->getUser();

        if (!$project || $project->getUser() !== $user) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['title'])) {
            $project->setTitle($data['title']);
        }

        if (array_key_exists('description', $data)) {
            $project->setDescription($data['description']);
        }

        $em->flush();

        return $this->json(['message' => 'Project updated successfully']);
    }

    /**
     * Eliminar un proyecto (solo si pertenece al usuario autenticado)
     */
    #[Route('/{id}', name: 'delete', methods: ['DELETE'])]
    public function deleteProject(int $id, EntityManagerInterface $em): JsonResponse
    {
        $project = $em->getRepository(Project::class)->find($id);
        $user = $this->getUser();

        // Verificamos que el proyecto exista
        if (!$project) {
            return $this->json(['error' => 'Project not found'], 404);
        }

        // Si el usuario no es el propietario y no es admin, denegar acceso
        if ($project->getUser() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Access denied'], 403);
        }

        $em->remove($project);
        $em->flush();

        return $this->json(['message' => 'Project deleted successfully']);
    }
}
