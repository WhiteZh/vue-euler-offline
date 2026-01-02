<script setup lang="ts">
import problemsTxt from "~root/project_euler_problems.txt?raw";
import {EulerProblem, ParseError, parseProblemsTxt} from "@/lib/euler.ts";
import {onMounted, ref} from "vue";
import {match, P} from "ts-pattern";

const problems = ref<EulerProblem[]>();

const inputs = ref(new Map<string, HTMLInputElement>());

function checkAnswer(problemTitle: string, problem: EulerProblem) {
  const input = inputs.value.get(problemTitle);

  if (input === undefined) {
    window.alert("Input element not found!");
    return;
  }

  try {
    if (problem.checkAnswer(input.value)) {
      window.alert("That was CORRECT! :)");
    } else {
      window.alert("That was incorrect... :(");
    }
  } catch (e) {
    match(e)
        .with(P.instanceOf(RangeError), () => {
          window.alert("The answer to this question is unknown");
        })
        .otherwise(() => {
          console.error(e);
        });
  }
}

onMounted(() => {
  try {
    problems.value = parseProblemsTxt(problemsTxt);
    console.log(problems.value);
  } catch (e) {
    if (e instanceof ParseError) {
      console.error(e.message);
      console.error(e.lines);
    } else {
      console.error(e);
    }
  }
});
</script>

<template>
  <div class="flex flex-col items-center gap-10 px-10">
    <div v-for="(problem, idx) in problems" :key="problem.title" class="font-mono">
      <h1 class="text-lg italic">{{ problem.title }}</h1>
      <div class="whitespace-pre">
        {{ problem.description }}
      </div>
      <div class="flex flex-row justify-center mt-7 gap-2">
        <input class="min-w-36 px-2 border rounded-md text-sm field-sizing-content text-center"
               :ref="el => inputs.set(problem.title, el as HTMLInputElement)"/>
        <button
            class="cursor-pointer border rounded-full px-2 hover:bg-neutral-300 active:bg-neutral-500"
            @click="checkAnswer(problem.title, problem)">
          check
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
</style>
