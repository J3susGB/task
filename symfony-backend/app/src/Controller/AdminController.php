<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Attribute\IsGranted;

// Este controlador contiene rutas protegidas que solo los administradores pueden usar

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
}
