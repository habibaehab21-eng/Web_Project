document.addEventListener('DOMContentLoaded', () => {

    // ==========================================
    // 1. MENU: Search & Filter
    // ==========================================
    const searchInput = document.querySelector('.search-input');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const allCards = document.querySelectorAll('.dish-card');

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            allCards.forEach(card => {
                const title = card.querySelector('h3')?.innerText.toLowerCase() || '';
                const desc = card.querySelector('p')?.innerText.toLowerCase() || '';
                card.style.display = (title.includes(searchTerm) || desc.includes(searchTerm)) ? 'block' : 'none';
            });
        });
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const category = btn.getAttribute('data-filter');
            allCards.forEach(card => {
                const cardCategory = card.getAttribute('data-category');
                card.style.display = (category === 'all' || cardCategory === category) ? 'block' : 'none';
            });
        });
    });

    // ==========================================
    // 2. BRANCHES: Toggle Opening Hours
    // ==========================================
    document.querySelectorAll('.hours-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            toggle.classList.toggle('active');
            const hoursDetails = toggle.nextElementSibling;
            if (hoursDetails) hoursDetails.classList.toggle('show');
        });
    });

    // ==========================================
    // 3. ORDER ONLINE: Cart & Checkout
    // ==========================================
    const cart = [];
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotalEl = document.getElementById('subtotal');
    const deliveryFeeEl = document.getElementById('deliveryFee');
    const totalAmountEl = document.getElementById('totalAmount');
    const areaSelect = document.getElementById('areaSelect');
    const checkoutForm = document.getElementById('checkoutForm');
    const trackingBox = document.getElementById('trackingBox');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const name = btn.getAttribute('data-name');
            const price = parseInt(btn.getAttribute('data-price'));
            const img = btn.getAttribute('data-img');

            const existingItem = cart.find(item => item.name === name);
            if (existingItem) { existingItem.qty++; } 
            else { cart.push({ name, price, img, qty: 1 }); }
            
            updateCartUI();
            const originalText = btn.textContent;
            btn.textContent = '✓ Added!';
            btn.style.backgroundColor = '#4CAF50';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.backgroundColor = '#C8956C';
            }, 1000);
        });
    });

    function updateCartUI() {
        if (!cartItemsContainer) return;
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="empty-cart-msg">Your cart is empty</p>';
        } else {
            cartItemsContainer.innerHTML = cart.map((item, index) => `
                <div class="cart-item">
                    <img src="${item.img}" alt="${item.name}">
                    <div class="cart-item-details">
                        <h4>${item.name}</h4>
                        <p>${item.price} EGP x ${item.qty}</p>
                    </div>
                    <button class="remove-item" data-index="${index}"><i class="fa-solid fa-trash"></i></button>
                </div>
            `).join('');

            document.querySelectorAll('.remove-item').forEach(removeBtn => {
                removeBtn.addEventListener('click', (e) => {
                    cart.splice(parseInt(e.currentTarget.getAttribute('data-index')), 1);
                    updateCartUI();
                });
            });
        }

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const delivery = areaSelect && areaSelect.value ? parseInt(areaSelect.value) : 0;

        if (subtotalEl) subtotalEl.textContent = `${subtotal} EGP`;
        if (deliveryFeeEl) deliveryFeeEl.textContent = `${delivery} EGP`;
        if (totalAmountEl) totalAmountEl.textContent = `${subtotal + delivery} EGP`;
    }

    if (areaSelect) areaSelect.addEventListener('change', updateCartUI);

    if (checkoutForm) {
        checkoutForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (cart.length === 0) { alert('Your cart is empty!'); return; }
            document.querySelector('.cart-box').style.display = 'none';
            document.querySelector('.checkout-box').style.display = 'none';
            if (trackingBox) trackingBox.style.display = 'block';

            let currentStep = 0;
            const steps = ['step1', 'step2', 'step3', 'step4'];
            function activateStep() {
                if (currentStep < steps.length) {
                    const stepEl = document.getElementById(steps[currentStep]);
                    if (stepEl) stepEl.classList.add('active');
                    currentStep++;
                    setTimeout(activateStep, 2500);
                }
            }
            if (document.getElementById('step1')) document.getElementById('step1').classList.add('active');
            setTimeout(activateStep, 1000);
        });
    }

    window.resetOrder = function() {
        cart.length = 0;
        updateCartUI();
        document.querySelector('.cart-box').style.display = 'block';
        document.querySelector('.checkout-box').style.display = 'block';
        if (trackingBox) trackingBox.style.display = 'none';
        if (checkoutForm) checkoutForm.reset();
        document.querySelectorAll('.step').forEach(step => step.classList.remove('active'));
    };

    // ==========================================
    // 4. RESERVATIONS: Complete Logic (Fixed Order)
    // ==========================================
    const DEPOSIT_PER_PERSON = 500;
    const branchSelect = document.getElementById('branchSelect');
    const guestCount = document.getElementById('guestCount');
    const reservationDate = document.getElementById('reservationDate');
    const reservationTime = document.getElementById('reservationTime');
    const depositAmount = document.getElementById('depositAmount');
    const reservationForm = document.getElementById('reservationForm');

    const summaryBranch = document.getElementById('summaryBranch');
    const summaryDate = document.getElementById('summaryDate');
    const summaryTime = document.getElementById('summaryTime');
    const summaryGuests = document.getElementById('summaryGuests');
    const summaryDeposit = document.getElementById('summaryDeposit');

    const branchNames = { 'downtown': 'Downtown Cairo', 'heliopolis': 'Heliopolis', 'newcairo': 'New Cairo' };

    // A. Update Summary on Change
    if (guestCount) {
        guestCount.addEventListener('change', () => {
            const guests = parseInt(guestCount.value) || 0;
            const deposit = guests * DEPOSIT_PER_PERSON;
            if (depositAmount) depositAmount.value = deposit > 0 ? `${deposit} EGP` : '0 EGP';
            if (summaryDeposit) summaryDeposit.textContent = `${deposit} EGP`;
            if (summaryGuests) summaryGuests.textContent = guests > 0 ? `${guests} ${guests === 1 ? 'Person' : 'People'}` : '-';
        });
    }
    if (branchSelect) {
        branchSelect.addEventListener('change', () => {
            if (summaryBranch) summaryBranch.textContent = branchNames[branchSelect.value] || '-';
        });
    }
    if (reservationDate) {
        reservationDate.addEventListener('change', () => {
            if (summaryDate) summaryDate.textContent = reservationDate.value || '-';
        });
        reservationDate.setAttribute('min', new Date().toISOString().split('T')[0]);
    }
    if (reservationTime) {
        reservationTime.addEventListener('change', () => {
            if (summaryTime) summaryTime.textContent = reservationTime.value || '-';
        });
    }

    // B. Payment Forms Toggle (Visa / Fawry)
    const radioVisa = document.getElementById('radioVisa');
    const radioFawry = document.getElementById('radioFawry');
    const visaForm = document.getElementById('visaForm');
    const fawryForm = document.getElementById('fawryForm');
    const fawryRef = document.getElementById('fawryRef');

    if (radioVisa && visaForm) {
        radioVisa.addEventListener('change', () => {
            visaForm.style.display = 'block';
            visaForm.style.animation = 'fadeInUp 0.4s ease-out';
            if (fawryForm) fawryForm.style.display = 'none';
        });
    }
    if (radioFawry && fawryForm) {
        radioFawry.addEventListener('change', () => {
            fawryForm.style.display = 'block';
            fawryForm.style.animation = 'fadeInUp 0.4s ease-out';
            if (visaForm) visaForm.style.display = 'none';
            if (fawryRef) fawryRef.textContent = 'FW-' + Math.floor(1000 + Math.random() * 9000) + '-' + Math.floor(1000 + Math.random() * 9000);
        });
    }

    // C. Card Formatting
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\s/g, '').replace(/\D/g, '');
            e.target.value = value.match(/.{1,4}/g)?.join(' ') || value;
        });
    }
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        expiryDateInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, '');
            e.target.value = value.length >= 2 ? value.substring(0, 2) + '/' + value.substring(2, 4) : value;
        });
    }

    // D. Form Submission & Alert
    if (reservationForm) {
        reservationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const guests = parseInt(guestCount?.value) || 0;
            const branch = branchSelect?.value;
            const paymentMethod = document.querySelector('input[name="payment"]:checked')?.value;

            if (!branch) { alert('Please select a branch!'); return; }
            if (guests === 0) { alert('Please select the number of guests!'); return; }
            if (!paymentMethod) { alert('Please select a payment method!'); return; }

            alert(`✅ Reservation Confirmed!\n\nBranch: ${branchNames[branch]}\nGuests: ${guests}\nDeposit: ${guests * DEPOSIT_PER_PERSON} EGP\nPayment: ${paymentMethod.toUpperCase()}\n\nA confirmation email will be sent shortly.`);

            reservationForm.reset();
            if (depositAmount) depositAmount.value = '0 EGP';
            if (summaryBranch) summaryBranch.textContent = '-';
            if (summaryDate) summaryDate.textContent = '-';
            if (summaryTime) summaryTime.textContent = '-';
            if (summaryGuests) summaryGuests.textContent = '-';
            if (summaryDeposit) summaryDeposit.textContent = '0 EGP';
            if (visaForm) visaForm.style.display = 'none';
            if (fawryForm) fawryForm.style.display = 'none';
        });
    }

    // ==========================================
    // 5. GLOBAL: Navbar Scroll Effect
    // ==========================================
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(27, 27, 27, 0.95)';
                navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                navbar.style.backdropFilter = 'blur(10px)';
            } else {
                navbar.style.backgroundColor = '#1B1B1B';
                navbar.style.boxShadow = 'none';
                navbar.style.backdropFilter = 'none';
            }
        });
    }
});