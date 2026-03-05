import "./theme.js";
import "./navbar.js";
import "./scroll.js";
import "./contact.js";
import { initAntigravity } from "./antigravity.js";
import { initBlog } from "./blog.js";

// Initialize Animations
document.addEventListener("DOMContentLoaded", () => {
    initAntigravity();
    initBlog();
});
