<script setup>
import { useStore } from '../store.js'
const s = useStore()
const card = c => s.courseSummary(s.currentSave.value, c.id)
const current = c => c.id === s.courseId.value && s.courseChosen.value
</script>

<template>
  <div class="veil" @click.self="s.closeCourses">
    <section class="sys quest saves" role="dialog" aria-modal="true" aria-labelledby="courses-title">
      <div class="sys-title"><i></i> Jobs</div>
      <div class="body">
        <h2 id="courses-title">What's the job?</h2>
        <p class="algo">One crew, one save file. Every job keeps its own score.</p>
        <ul class="save-list">
          <li v-for="c in s.courses" :key="c.id" class="save" :class="{ current: current(c) }">
            <div class="save-main">
              <b class="save-name">{{ c.title }}</b>
              <span class="save-meta">
                {{ c.algo }} ·
                <template v-if="card(c).started">
                  Level {{ card(c).level }} · {{ card(c).gates }} / {{ card(c).gatesTotal }} gates ·
                  rank <span class="rank-letter" :class="card(c).rank">{{ card(c).rank }}</span> · {{ card(c).lessons }} / {{ card(c).lessonsTotal }} lessons
                </template>
                <template v-else>not started · {{ card(c).gatesTotal }} gates · {{ card(c).lessonsTotal }} lessons</template>
              </span>
            </div>
            <div class="row save-actions">
              <button class="btn" @click="s.selectCourse(c.id)">{{ current(c) ? 'Continue' : card(c).started ? 'Resume' : 'Take the job' }}</button>
            </div>
          </li>
        </ul>
        <div class="row" v-if="s.courseChosen.value">
          <button class="btn ghost" type="button" @click="s.closeCourses">Back</button>
          <span class="dim">Esc closes</span>
        </div>
      </div>
    </section>
  </div>
</template>
