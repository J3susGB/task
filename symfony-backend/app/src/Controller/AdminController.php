<?php

namespace App\Controller;

use App\Repository\ProjectRepository;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Este controlador contiene rutas protegidas que solo los administradores pueden usar

#[Route('/api/admin', name: 'admin_')]
#[IsGranted('ROLE_ADMIN')] // Aplica a TODO el controlador
final class AdminController extends AbstractController
{
    // Ruta protegida para obtener todos los usuarios registrados en el sistema
    #[Route('/api/admin/users', name: 'admin_users', methods: ['GET'])]
    public function listUsers(UserRepository $userRepo): JsonResponse
    {
        // Obtenemos todos los usuarios desde la base de datos
        $users = $userRepo->findAll();

        // Formateamos la respuesta en JSON (solo los datos relevantes)
        $data = array_map(fn($user) => [
            'id' => $user->getId(),
            'email' => $user->getEmail(),
            'roles' => $user->getRoles(),
        ], $users);

        // Devolvemos la respuesta como JSON
        return $this->json($data);
    }

    /**
     * Actualizar los roles de un usuario concreto.
     * Endpoint: PUT /api/admin/users/{id}/roles
     */
    #[Route('/users/{id}/roles', name: 'update_user_roles', methods: ['PUT'])]
    public function updateUserRoles(
        int $id,
        Request $request,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $userRepo->find($id); // Buscamos el usuario

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        $data = json_decode($request->getContent(), true); // Obtenemos datos
        $roles = $data['roles'] ?? [];

        if (!is_array($roles)) {
            return $this->json(['error' => 'Invalid roles format'], 400);
        }

        $user->setRoles($roles); // Establecemos los nuevos roles
        $em->flush(); // Guardamos en la base de datos

        return $this->json([
            'message' => 'Roles updated',
            'user' => [
                'id' => $user->getId(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles()
            ]
        ]);
    }

    /**
     * Eliminar un usuario específico (menos a ti mismo).
     * Endpoint: DELETE /api/admin/users/{id}
     */
    #[Route('/users/{id}', name: 'delete_user', methods: ['DELETE'])]
    public function deleteUser(
        int $id,
        UserRepository $userRepo,
        EntityManagerInterface $em
    ): JsonResponse {
        $user = $userRepo->find($id); // Buscar usuario por ID

        if (!$user) {
            return $this->json(['error' => 'User not found'], 404);
        }

        if ($user === $this->getUser()) {
            return $this->json(['error' => 'You cannot delete yourself'], 403); // Por seguridad
        }

        $em->remove($user);
        $em->flush();

        return $this->json(['message' => 'User deleted successfully']);
    }

    /**
     * Ver todos los proyectos creados por todos los usuarios.
     * Solo accesible por administradores (ROLE_ADMIN).
     * 
     * Endpoint: GET /api/admin/projects
     */
    #[Route('/projects', name: 'admin_projects', methods: ['GET'])]
    public function listAllProjects(ProjectRepository $projectRepo): JsonResponse
    {
        // Obtenemos todos los proyectos existentes en la base de datos
        $projects = $projectRepo->findAll();

        // Transformamos los datos para devolverlos como JSON
        $data = array_map(fn($project) => [
            'id' => $project->getId(),
            'title' => $project->getTitle(),
            'description' => $project->getDescription(),
            'user' => [ // Incluimos información del usuario dueño del proyecto
                'id' => $project->getUser()->getId(),
                'email' => $project->getUser()->getEmail()
            ]
        ], $projects);

        // Devolvemos todos los proyectos en formato JSON
        return $this->json($data);
    }
}
