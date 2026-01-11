Se creó   async getTestingUser(): Promise<User> {
    const userId = 62;
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`Usuario con id ${userId} no encontrado`);
    }

    return user;
  }  para traer al usuario de pruebas  


    @Get('testing')
  @ApiOperation({
    summary: 'Endpoint de testing',
    description: 'Obtiene el usuario con id 62 para testing',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Usuario obtenido exitosamente',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acceso requerido',
  })
  async getTestingUser() {
    try {
      const user = await this.networkService.getTestingUser();
      return {
        statusCode: HttpStatus.OK,
        message: 'Usuario obtenido exitosamente',
        data: user,
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        error.message || 'Error al obtener el usuario',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }  



  //  /**
   * Resetear todos los claims de un usuario
   * POST /network/reset-user-claims/:userId
   */
  @Post('reset-user-claims/:userId')
  @ApiOperation({
    summary: 'Resetear claims de usuario',
    description: 'Resetea todos los claims de un usuario para presentaciones en dev. Solo usuarios autorizados pueden ejecutar este endpoint.',
  })
  @ApiParam({
    name: 'userId',
    type: Number,
    description: 'ID del usuario cuyos claims se van a resetear',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Claims reseteados exitosamente',
    type: ResetUserClaimsResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.FORBIDDEN,
    description: 'Usuario no autorizado para ejecutar este endpoint',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Usuario objetivo no encontrado',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Token de acceso requerido',
  })
  async resetUserClaims(
    @Request() req: any,
    @Param('userId', ParseIntPipe) targetUserId: number,
  ): Promise<{ statusCode: number; message: string; data: ResetUserClaimsResponseDto }> {
    const userId = req.user?.id || req.user?.sub;

    if (!userId) {
      throw new HttpException(this.i18n.t('network.ERRORS.USER_NOT_AUTHENTICATED'), HttpStatus.UNAUTHORIZED);
    }

    // Validar que el usuario autenticado esté en la lista de permitidos
    if (!this.networkService.isUserAllowed(userId)) {
      throw new ForbiddenException(
        'No tienes permisos para usar este endpoint. Solo usuarios autorizados pueden acceder.',
      );
    }

    const result = await this.networkService.resetUserClaims(targetUserId);

    return {
      statusCode: HttpStatus.OK,
      message: result.message,
      data: result,
    };
  }
}   