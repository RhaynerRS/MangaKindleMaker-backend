/**
 * @openapi
 * securitySchemes:
 *   ApiKeyAuth:
 *     type: apiKey
 *     in: header
 *     name: apikey
 *
 * /api/users/signup:
 *   post:
 *     description: sign up a new user
 *     tags: [user]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             Name:
 *               type: string
 *             Username:
 *               type: string
 *             Password:
 *               type: string
 *             Email:
 *               type: string
 *     responses:
 *       200:
 *         description: Returns a a mobi file
 * /api/users/signin:
 *   post:
 *     description: sign in user
 *     tags: [user]
 *     produces:
 *       - application/json
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             Username:
 *               type: string
 *             Password:
 *               type: string
 *     responses:
 *       200:
 *         description: Returns the token for apis
 * /api/mangas/generate-volume:
 *   post:
 *     description: generate manga volume
 *     tags: [manga]
 *     security:
 *       - ApiKeyAuth: []
 *     produces:
 *       - application/json
 *     parameters:
 *       - in: header
 *         name: apikey
 *         schema:
 *           type: string
 *           format: uuid
 *         required: true
 *       - name: body
 *         description: Infos about manga volume.
 *         in: body
 *         required: true
 *         schema:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *             start:
 *               type: number
 *             end:
 *               type: number
 *             folder:
 *               type: string
 *             author:
 *               type: string
 *     responses:
 *       200:
 *         description: Returns a a mobi file
 */