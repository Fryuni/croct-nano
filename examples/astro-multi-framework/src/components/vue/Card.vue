<script setup>
import {useStore} from '@nanostores/vue';
import {homeBannerStore} from '../state';

const store = useStore(homeBannerStore);
</script>

<template>
  <div class="card">
    <div style="align: center">Vue</div>
    <h1>{{store.content.title}}</h1>
    <div class="text"><strong>{{store.content.subtitle}}</strong></div>
    <p>
      <a href="{{store.content.cta.link}}">{{store.content.cta.label}}</a>
    </p>
  </div>
</template>
