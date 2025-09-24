import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { courses } from "../database/schema.ts"
import z from "zod"
import { db } from "../database/client.ts"
import { eq } from "drizzle-orm"

export const updateCourseRoute: FastifyPluginAsyncZod = async (server) => {
server.put(
  '/courses/:id',
  {
    schema: {
      tags: ['courses'],
      summary: 'Update a course',
      params: z.object({
        id: z.string(),
      }),
      body: z.object({
        title: z.string(),
        description: z.string().optional()
      }),
      response: {
        200: z.object({
          course: z.object({
            id: z.uuid(),
            title: z.string(),
            description: z.string().nullable()
          })
        }),
        404: z.object({ message: z.string()}).describe('Course not found!')
      }
    },
  },
  async (request, reply) => {
    const courseId = request.params.id
    const { title, description } = request.body

    const existingCourse = await db
      .select()
      .from(courses)
      .where(eq(courses.id, courseId))

    if(existingCourse.length === 0) {
      return reply.status(404).send({ message: 'Course not found'})
    }

    const updatedCourse = await db
      .update(courses)
      .set({ 
        title, 
        description: description || existingCourse[0].description 
      })
      .where(eq(courses.id, courseId))
      .returning()

    return reply.status(200).send({ course: updatedCourse[0] })
  }
)}



