<script setup>
import { computed } from 'vue'
import { useStore } from '../store.js'
const s = useStore()
const T = computed(() => s.course.value.training)
const rankPct = computed(() => {
  const p = s.trainingProgress.value
  if (p.ceil === null) return 100
  return Math.round((s.trainingXp.value - p.floor) / (p.ceil - p.floor) * 100)
})
</script>

<template>
  <aside class="sys status">
    <div class="sys-title"><i></i> Status window</div>
    <div class="body">
      <nav class="mode" role="tablist" aria-label="Mode">
        <button role="tab" :class="{ active: s.mode.value === 'heist' }" :aria-selected="s.mode.value === 'heist'" @click="s.setMode('heist')">Heist</button>
        <button role="tab" :class="{ active: s.mode.value === 'training' }" :aria-selected="s.mode.value === 'training'" @click="s.setMode('training')">Training</button>
      </nav>
      <div class="course-line">{{ s.course.value.title }} <small>{{ s.course.value.algo }}</small></div>
      <div class="name">{{ s.player.value.name }}</div>

      <template v-if="s.mode.value === 'heist'">
        <div class="role">{{ s.level.value === 0 ? 'Unranked. Nobody knows your name yet.' : "Marguerite's crew" }}</div>
        <div class="lvl"><b>{{ s.level.value }}</b><small>level</small></div>
        <div class="bar" role="progressbar" :aria-valuenow="s.xpInLevel.value" :aria-valuemax="s.xpPerLevel.value">
          <i :style="{ width: s.xpPct.value + '%' }"></i>
        </div>
        <div class="xp"><span>{{ s.xpInLevel.value }} / {{ s.xpPerLevel.value }} xp</span><span>{{ s.player.value.xp }} total</span></div>
        <div class="stats">
          <div class="stat" v-for="st in s.statList.value" :key="st.key">
            <span>{{ st.label }}</span>
            <div class="bar"><i :style="{ width: Math.min(100, st.value * 4) + '%' }"></i></div>
            <span>{{ st.value }}</span>
          </div>
        </div>
        <div class="titles">Title: <b>{{ s.title.value }}</b><br>Gates cleared: <b>{{ s.clearedCount.value }}</b></div>
      </template>

      <template v-else>
        <div class="role">The back room above the laundromat.</div>
        <div class="lvl"><b class="rank-letter" :class="s.trainingRank.value">{{ s.trainingRank.value }}</b><small>training rank</small></div>
        <div class="bar" role="progressbar" :aria-valuenow="rankPct" aria-valuemax="100">
          <i :style="{ width: rankPct + '%' }"></i>
        </div>
        <div class="xp">
          <span v-if="s.trainingProgress.value.ceil !== null">{{ s.trainingXp.value - s.trainingProgress.value.floor }} / {{ s.trainingProgress.value.ceil - s.trainingProgress.value.floor }} xp to next rank</span>
          <span v-else>Top of the ladder for now</span>
          <span>{{ s.trainingXp.value }} total</span>
        </div>
        <div class="titles">Lessons trained: <b>{{ s.nodesCleared.value }} / {{ T.NODES.length }}</b></div>
        <div class="kit-head">Kit: <b>{{ s.toolsCleared.value }} / {{ T.TOOLS.length }}</b> &middot; <b>{{ s.kitXp.value }} kit xp</b></div>
        <div class="kit-grid">
          <div v-for="t in T.TOOLS" :key="t.id" class="kit-tile" :class="{ lit: s.nodeState(t.id) === 'cleared' }" :title="t.algo + ' — ' + t.title">{{ t.algo }}</div>
        </div>
      </template>

      <div class="row">
        <button class="reset" @click="s.openCourses">Jobs</button>
        <button class="reset" @click="s.openSaves">Save files</button>
      </div>
    </div>
  </aside>
</template>
