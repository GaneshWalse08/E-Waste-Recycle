// --- Mobile Navigation Menu ---
const hamburger = document.querySelector(".hamburger");
const navMenu = document.querySelector(".nav-menu");

// Event listener for hamburger menu click
hamburger.addEventListener("click", () => {
    // Toggle 'active' class on both hamburger and nav menu
    hamburger.classList.toggle("active");
    navMenu.classList.toggle("active");
});

// Close the menu when a link is clicked
document.querySelectorAll(".nav-link").forEach(n => n.addEventListener("click", () => {
    hamburger.classList.remove("active");
    navMenu.classList.remove("active");
}));


// --- Smooth Scrolling for Navigation Links ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();

        // Get the target element
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            // Smoothly scroll to the target element
            target.scrollIntoView({
                behavior: 'smooth'
            });
        }
    });
});


// --- Contact Form Submission ---
// This is a basic example. For a real project, you'd send this data to a server or Firebase.
const contactForm = document.getElementById('contact-form');

if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault(); // Prevent the default form submission

        // Get form data
        const name = this.querySelector('input[name="name"]').value;
        const email = this.querySelector('input[name="email"]').value;
        const message = this.querySelector('textarea[name="message"]').value;

        // Simple validation
        if (name && email && message) {
            // For this example, we'll just log it and show an alert.
            // In your project, you would integrate this with Firebase to store the message.
            console.log('Form Submitted!');
            console.log('Name:', name);
            console.log('Email:', email);
            console.log('Message:', message);
            
            // Provide feedback to the user - A custom modal would be better than an alert.
            alert('Thank you for your message! We will get back to you soon.');
            
            // Clear the form
            this.reset();
        } else {
            alert('Please fill out all fields before submitting.');
        }
    });
}

// --- NEW: FAQ Accordion ---
const faqItems = document.querySelectorAll('.faq-item');

faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
        // Close other open FAQ items
        const openItem = document.querySelector('.faq-item.active');
        if(openItem && openItem !== item) {
            openItem.classList.remove('active');
        }

        // Toggle the clicked item
        item.classList.toggle('active');
    });
});


// --- Add a subtle scroll animation effect ---
const scrollElements = document.querySelectorAll("section");

const elementInView = (el, dividend = 1) => {
  const elementTop = el.getBoundingClientRect().top;
  return (
    elementTop <= (window.innerHeight || document.documentElement.clientHeight) / dividend
  );
};

const displayScrollElement = (element) => {
  element.classList.add("scrolled");
};

const hideScrollElement = (element) => {
  element.classList.remove("scrolled");
};

const handleScrollAnimation = () => {
  scrollElements.forEach((el) => {
    if (elementInView(el, 1.25)) {
      displayScrollElement(el);
    } else {
      hideScrollElement(el);
    }
  })
}

// Add a CSS class for the animation
const style = document.createElement('style');
style.innerHTML = `
section {
  transition: opacity 1s ease-in-out, transform 1s ease-in-out;
  opacity: 0;
  transform: translateY(20px);
}
section.scrolled {
  opacity: 1;
  transform: translateY(0);
}
`;
document.head.appendChild(style);

window.addEventListener("scroll", () => { 
  handleScrollAnimation();
});

// Initial check on page load
handleScrollAnimation();
