// Every course the shell can run, in display order. Add a course folder, import its
// course object, append it here.
import { course as algorithms } from './algorithms/course.js'

export const COURSES = [algorithms]
export const DEFAULT_COURSE = 'algorithms'
export const RUNNERS = ['python']
export const courseById = id => COURSES.find(c => c.id === id) ?? null
