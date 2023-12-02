<script setup>
import {useStore} from '@nanostores/vue';
import {$counter, delta} from '../state';

const count = useStore($counter);

const add = () => delta(1);
const subtract = () => delta(-1);
</script>

<template>
  <div class="card">
    <div class="text"><slot /></div>
    <div class="counter">
      <button @click="subtract()">-</button>
      <pre>{{count}}</pre>
      <button @click="add()">+</button>
    </div>
  </div>
</template>
