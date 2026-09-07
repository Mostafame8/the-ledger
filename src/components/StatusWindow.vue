<script setup>
import { useStore } from '../store.js'
const s = useStore()
</script>

<template>
  <aside class="sys status">
    <div class="sys-title"><i></i> Status window</div>
    <div class="body">
      <div class="name">{{ s.player.value.name }}</div>
      <div class="role">{{ s.level.value === 0 ? 'Unranked. Nobody knows your name yet.' : "Marguerite's crew" }}</div>
      <div class="lvl"><b>{{ s.level.value }}</b><small>level</small></div>
      <div class="bar" role="progressbar" :aria-valuenow="s.xpInLevel.value" :aria-valuemax="s.xpPerLevel">
        <i :style="{ width: s.xpPct.value + '%' }"></i>
      </div>
      <div class="xp"><span>{{ s.xpInLevel.value }} / {{ s.xpPerLevel }} xp</span><span>{{ s.player.value.xp }} total</span></div>
      <div class="stats">
        <div class="stat" v-for="st in s.statList.value" :key="st.key">
          <span>{{ st.label }}</span>
          <div class="bar"><i :style="{ width: Math.min(100, st.value * 4) + '%' }"></i></div>
          <span>{{ st.value }}</span>
        </div>
      </div>
      <div class="titles">Title: <b>{{ s.title.value }}</b><br>Gates cleared: <b>{{ s.clearedCount.value }}</b></div>
      <button class="reset" @click="s.reset">Wipe save</button>
    </div>
  </aside>
</template>
