<template>
<div v-if="$props.type=='question'" class="question-container x-container">
    <p style="vertical-align: middle;display: flex;gap:5;align-items: center;    margin-top: 12px;"><n-icon :size="24"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M10 2a8 8 0 1 1 0 16a8 8 0 0 1 0-16m0 1a7 7 0 1 0 0 14a7 7 0 0 0 0-14m0 10.5a.75.75 0 1 1 0 1.5a.75.75 0 0 1 0-1.5m0-8a2.5 2.5 0 0 1 1.651 4.377l-.154.125l-.219.163l-.087.072a2 2 0 0 0-.156.149c-.339.36-.535.856-.535 1.614a.5.5 0 0 1-1 0c0-1.012.293-1.752.805-2.298a3 3 0 0 1 .356-.323l.247-.185l.118-.1A1.5 1.5 0 1 0 8.5 8a.5.5 0 0 1-1 .001A2.5 2.5 0 0 1 10 5.5"/></svg></n-icon>
    <span style="font-weight: bold;">Question</span></p>
    <slot></slot>
</div>
<div v-if="$props.type=='attached-file'" class="attached-file-container x-container">
    <p style="vertical-align: middle;display: flex;gap:5;align-items: center;    margin-top: 12px;"><n-icon :size="24">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="m5.28 10.609l5.304-5.304a2.75 2.75 0 0 1 4.064 3.697a5.5 5.5 0 0 1 1.611.285a4.252 4.252 0 0 0-6.736-5.042L4.22 9.548a.75.75 0 0 0 1.06 1.06m2.829 4.95l.893-.894a5.5 5.5 0 0 0 .349 1.773l-.182.181A2.75 2.75 0 0 1 5.28 12.73l5.657-5.657a.75.75 0 1 1 1.06 1.06l-5.656 5.658a1.25 1.25 0 0 0 1.768 1.768M19 14.5a4.5 4.5 0 1 1-9 0a4.5 4.5 0 0 1 9 0m-2.147.354l.003-.003a.5.5 0 0 0 .144-.348v-.006a.5.5 0 0 0-.146-.35l-2-2a.5.5 0 0 0-.708.707L15.293 14H12.5a.5.5 0 0 0 0 1h2.793l-1.147 1.146a.5.5 0 0 0 .708.708z"/></svg>
    </n-icon>
    <span style="font-weight: bold;">You may refer to some external attached files.</span></p>
    <slot></slot>
    </div>

<div v-if="$props.type=='info'" class="info-container x-container">
    <p style="vertical-align: middle;display: flex;gap:5;align-items: center;    margin-top: 12px;"><n-icon :size="24">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="currentColor" d="M12 17q.425 0 .713-.288T13 16v-4q0-.425-.288-.712T12 11t-.712.288T11 12v4q0 .425.288.713T12 17m0-8q.425 0 .713-.288T13 8t-.288-.712T12 7t-.712.288T11 8t.288.713T12 9m0 13q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22m0-2q3.35 0 5.675-2.325T20 12t-2.325-5.675T12 4T6.325 6.325T4 12t2.325 5.675T12 20m0-8"/></svg>
    </n-icon>
    <span style="font-weight: bold;">{{ $props.title }}</span></p>
    <slot></slot>
    </div>

    <div v-if="$props.type=='tricky'" class="tricky-container x-container">
    <p style="vertical-align: middle;display: flex;gap:5;align-items: center;    margin-top: 12px;"><n-icon :size="24">
        <svg width="800px" height="800px" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--twemoji" preserveAspectRatio="xMidYMid meet"><circle fill="#FFCB4C" cx="18" cy="17.018" r="17"></circle><path fill="#65471B" d="M14.524 21.036a.914.914 0 0 1-.312-.464a.799.799 0 0 1 .59-1.021c4.528-1.021 7.577 1.363 7.706 1.465c.384.306.459.845.173 1.205c-.286.358-.828.401-1.211.097c-.11-.084-2.523-1.923-6.182-1.098a.91.91 0 0 1-.764-.184z"></path><ellipse fill="#65471B" cx="13.119" cy="11.174" rx="2.125" ry="2.656"></ellipse><ellipse fill="#65471B" cx="24.375" cy="12.236" rx="2.125" ry="2.656"></ellipse><path fill="#F19020" d="M17.276 35.149s1.265-.411 1.429-1.352c.173-.972-.624-1.167-.624-1.167s1.041-.208 1.172-1.376c.123-1.101-.861-1.363-.861-1.363s.97-.4 1.016-1.539c.038-.959-.995-1.428-.995-1.428s5.038-1.221 5.556-1.341c.516-.12 1.32-.615 1.069-1.694c-.249-1.08-1.204-1.118-1.697-1.003c-.494.115-6.744 1.566-8.9 2.068l-1.439.334c-.54.127-.785-.11-.404-.512c.508-.536.833-1.129.946-2.113c.119-1.035-.232-2.313-.433-2.809c-.374-.921-1.005-1.649-1.734-1.899c-1.137-.39-1.945.321-1.542 1.561c.604 1.854.208 3.375-.833 4.293c-2.449 2.157-3.588 3.695-2.83 6.973c.828 3.575 4.377 5.876 7.952 5.048l3.152-.681z"></path><path fill="#65471B" d="M9.296 6.351a.925.925 0 0 1-.391-.399a.8.8 0 0 1 .393-1.112c4.266-1.831 7.699-.043 7.843.034c.433.231.608.747.391 1.154c-.216.405-.74.546-1.173.318c-.123-.063-2.832-1.432-6.278.047a.915.915 0 0 1-.785-.042zm12.135 3.75a.924.924 0 0 1-.362-.424a.8.8 0 0 1 .468-1.084c4.381-1.536 7.685.48 7.823.567c.415.26.555.787.312 1.178c-.242.39-.776.495-1.191.238c-.12-.072-2.727-1.621-6.267-.379a.924.924 0 0 1-.783-.096z"></path></svg></n-icon>
    <span style="font-weight: bold;">{{$props.title}}</span></p>
    <slot></slot>
</div>
</template>
<script setup>
defineProps({
    type: String,
    title: String
})
</script>

<style>
.x-container{
    margin: 20px auto;
    max-width: 800px;
    padding-left:20px;
    padding-right:20px;
    padding-top: 5px;
    padding-bottom: 5px;
    font-family: Arial, sans-serif;
    line-height: 1.5em;
    align-items: center;
    background-color: var(--bg-color);
    /* background-image: linear-gradient(90deg, var(--bg-color) , var(--bg-color) 20%, transparent ); */
    border-left-color: var(--core-color);
    border-left-width: 5px;
    border-left-style: solid;
    overflow: hidden;
    position: relative;
    z-index: 1;
    *{
        margin: 0;
        padding: 0;
    }
}
.x-boxed-container{
    max-width: 600px;
    width: 60%;
    margin: 20px auto;
    padding: 20px;
    border-radius: 25px;
    box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
    border: var(--core-color) 2px solid;
    background-color: var(--bg-color);
}
.question-container{
    --core-color: #b30a0a;
    --bg-color: #fae2e2;
}

.attached-file-container{
    --core-color: #cfcfffd2;
    --bg-color: #f6f6ff;
}
.tricky-container{
    --core-color: #d2cc0b;
    --bg-color: #f8f8f5d1;
}
.info-container{
    --core-color: #1900ffd6;
    --bg-color: #ccc8ff50;;
}
</style>