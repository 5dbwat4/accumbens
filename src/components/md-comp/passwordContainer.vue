<!-- THIS FILE WILL BE PROCESSED BY JS-OBFUCATOR -->

<template>
  <div v-if="!matched">
    <p>You may need to input a password. <span style="font-family: Georgia, 'Times New Roman', Times, serif;">Offering it <i>sacrifices</i> lest it emerging from its <strong>crypt</strong> and wreak havoc.</span></p>
    <n-input-group>
    <n-input
      v-model:value="password"
      type="password"
      placeholder="Input something ..."
      @keyup.enter="submitPassword" style="--n-color: rgb(255 255 255 / 35%);"
      autofocus
    ></n-input>
    <n-button @click="submitPassword">Attempt</n-button></n-input-group>
    <div>
      <p>
        遗憾的是，由于框架本身限制（MDX直接编译成js，除非整点eval花活（我们还有复杂的import/export关系，所以eval也很难），否则我们很难像mkdocs可以将html字符串加密，解密后直接innerHTML来进文档流）
      </p>
      <p>
        所以我们本质上是把文章藏了起来。如果你去翻代码/整点基本的JS调试，那必然是能把这个文章给读出来的
      </p>
      <p>如果你有什么好的加密办法，欢迎给我提issue/发PR</p>
    </div>
  </div>
  <slot v-else></slot>
</template>
<script setup>
import { ref, computed } from "vue";
import { useRoute } from "vue-router";
import { MD5 } from "crypto-js";

const route = useRoute();
const password = ref("");
const matched = ref(false);

const props = defineProps({
  md5: {
    // Note: hex string
    type: String,
    required: true,
  },
});

// console.log(`PasswordContainer initialized with MD5: ${props.md5}`);


const checkPassword = (password) => {
  const md5 = MD5(password).toString();
  // console.log(`Checking password: ${password}, MD5: ${md5}, Expected: ${props.md5}`);
  
  return md5 === props.md5;
};

// Step 1: Attempt to read password from location.search
const searchParams = new URLSearchParams(route.query);
if (searchParams.has("sacrifices")) {
  const inputPassword = searchParams.get("sacrifices");
  if (inputPassword) {
    matched.value = checkPassword(inputPassword);
  }
}


// Step 2: Then check localStorage
if (!matched.value) {
  try{
    const storedPassword = JSON.parse(localStorage.getItem("__5dbwat4_proj__accumbens__password_sacrifices"))[location.pathname];
    // console.log(`Stored password from localStorage: ${storedPassword}`);
    if (storedPassword) {
    matched.value = checkPassword(storedPassword);
  }
  } catch (error) {
    console.error("Error accessing localStorage:", error);
  }

}

// Step 3: If not matched, check the input field
const submitPassword = () => {
  matched.value = checkPassword(password.value);
  if(matched.value) {
    // Store the password in localStorage for future visits
    try {
      const storedPasswords = JSON.parse(localStorage.getItem("__5dbwat4_proj__accumbens__password_sacrifices")) || {};
      storedPasswords[location.pathname] = password.value;
      localStorage.setItem("__5dbwat4_proj__accumbens__password_sacrifices", JSON.stringify(storedPasswords));
    } catch (error) {
      console.error("Error saving password to localStorage:", error);
    }
  }
};
</script>
