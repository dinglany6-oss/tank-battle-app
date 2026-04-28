const EMAILJS_PUBLIC_KEY = "WZ7rJ8ewfanDpgeid";
const EMAILJS_SERVICE_ID = "service_4bt8dio";
const EMAILJS_TEMPLATE_ID = "template_3x84dwr";

const form = document.getElementById("customerForm");
const feedback = document.getElementById("feedback");
const submitBtn = document.getElementById("submitBtn");
const phoneInput = document.getElementById("phone");
const phoneError = document.getElementById("phoneError");
const testimonials = Array.from(document.querySelectorAll(".testimonial-item"));
const prevTestimonialBtn = document.getElementById("prevTestimonial");
const nextTestimonialBtn = document.getElementById("nextTestimonial");

emailjs.init({
  publicKey: EMAILJS_PUBLIC_KEY
});

let currentTestimonialIndex = 0;
let testimonialTimer = null;

function hasEmailJsConfig() {
  return (
    EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID"
  );
}

function validateEmailJsIdFormat() {
  if (!EMAILJS_SERVICE_ID.startsWith("service_")) {
    showFeedback("EmailJS 配置错误：Service ID 应该以 service_ 开头。", "error");
    return false;
  }
  if (!EMAILJS_TEMPLATE_ID.startsWith("template_")) {
    showFeedback("EmailJS 配置错误：Template ID 应该以 template_ 开头。", "error");
    return false;
  }
  return true;
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `feedback ${type}`;
}

function validateRequiredFields(name, phone, demand) {
  if (!name || !phone || !demand) {
    showFeedback("请先填写所有必填项（姓名、电话、需求描述）。", "error");
    return false;
  }
  return true;
}

function isValidPhone(phone) {
  return /^1\d{10}$/.test(phone);
}

function setPhoneError(message) {
  if (!phoneInput || !phoneError) return;
  phoneError.textContent = message;
  phoneInput.classList.toggle("input-invalid", Boolean(message));
}

function sanitizePhoneInput() {
  if (!phoneInput) return;
  phoneInput.value = phoneInput.value.replace(/\D/g, "").slice(0, 11);
}

function validatePhoneOnInput() {
  if (!phoneInput) return;
  sanitizePhoneInput();
  if (!phoneInput.value) {
    setPhoneError("");
    return;
  }
  if (phoneInput.value.length < 11) {
    setPhoneError("手机号需为 11 位数字。");
    return;
  }
  if (!isValidPhone(phoneInput.value)) {
    setPhoneError("请输入正确的中国大陆手机号（1开头，共11位）。");
    return;
  }
  setPhoneError("");
}

function showTestimonialByIndex(index) {
  if (!testimonials.length) return;
  testimonials.forEach(function (item, i) {
    item.classList.toggle("active", i === index);
  });
}

function goToTestimonial(direction) {
  if (!testimonials.length) return;
  currentTestimonialIndex = (currentTestimonialIndex + direction + testimonials.length) % testimonials.length;
  showTestimonialByIndex(currentTestimonialIndex);
}

function startTestimonialAutoplay() {
  if (!testimonials.length) return;
  clearInterval(testimonialTimer);
  testimonialTimer = setInterval(function () {
    goToTestimonial(1);
  }, 4500);
}

function setupTestimonialControls() {
  showTestimonialByIndex(currentTestimonialIndex);
  startTestimonialAutoplay();
  if (prevTestimonialBtn) {
    prevTestimonialBtn.addEventListener("click", function () {
      goToTestimonial(-1);
      startTestimonialAutoplay();
    });
  }
  if (nextTestimonialBtn) {
    nextTestimonialBtn.addEventListener("click", function () {
      goToTestimonial(1);
      startTestimonialAutoplay();
    });
  }
}

setupTestimonialControls();
if (phoneInput) {
  phoneInput.addEventListener("input", validatePhoneOnInput);
  phoneInput.addEventListener("blur", validatePhoneOnInput);
}

form.addEventListener("submit", async function (event) {
  event.preventDefault();
  showFeedback("", "");

  if (!hasEmailJsConfig()) {
    showFeedback("EmailJS 还没配置完成：请先在 script.js 填入 Public Key、Service ID、Template ID。", "error");
    return;
  }
  if (!validateEmailJsIdFormat()) {
    return;
  }

  const formData = new FormData(form);
  const name = (formData.get("name") || "").toString().trim();
  const phone = (formData.get("phone") || "").toString().trim();
  const wechat = (formData.get("wechat") || "").toString().trim();
  const demand = (formData.get("demand") || "").toString().trim();

  if (!validateRequiredFields(name, phone, demand)) {
    return;
  }
  if (!isValidPhone(phone)) {
    setPhoneError("请输入正确的中国大陆手机号（1开头，共11位）。");
    showFeedback("请先修正电话格式，再提交。", "error");
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = "提交中...";

  const templateParams = {
    name: name,
    phone: phone,
    wechat: wechat || "未填写",
    demand: demand,
    message: demand,
    request: demand,
    requirement: demand,
    customer_name: name,
    customer_phone: phone,
    customer_wechat: wechat || "未填写",
    customer_demand: demand,
    customer_message: demand,
    customer_request: demand
  };

  try {
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);
    showFeedback("提交成功", "success");
    form.reset();
  } catch (error) {
    console.error("EmailJS 发送失败：", error);
    const reason = error && (error.text || error.message) ? `（${error.text || error.message}）` : "";
    showFeedback(`提交失败，请检查 EmailJS 配置后重试${reason}`, "error");
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = "立即提交";
  }
});
