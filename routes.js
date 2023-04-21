/**
 * @openapi
* tags:
 *   name: manga
 *   description: Mangá creation endpoints releated
 * /api/mangas/generate-volume:
 *   post:
 *     description: generate manga volume
 *     tags: [manga]
 *     produces:
 *       - application/json
 *     parameters:
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