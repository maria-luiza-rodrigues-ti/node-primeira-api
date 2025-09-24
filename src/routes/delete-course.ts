import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { courses } from "../database/schema.ts"
import z from "zod"
import { db } from "../database/client.ts"
import { eq } from "drizzle-orm"

export const deleteCourseRoute: FastifyPluginAsyncZod = async (server) => {
server.delete('/courses/:id', {
  schema: {
    tags: ['courses'],
    summary: 'Delete a course',
    params: z.object({
      id: z.uuid()
    }),
    response: {
      204: z.null().describe('Course deleted'),
      404: z.object({ message: z.string() }).describe('Course not found')
    }
  }
} , async(request, reply) => {
  const courseId = request.params.id

  const existingCourse = await db.select().from(courses).where(eq(courses.id, courseId))

  if(existingCourse.length === 0) {
    return reply.status(404).send({ message: 'Course not found'})
  }

  await db.delete(courses).where(eq(courses.id, courseId))

  return reply.status(204).send()
})}



