/**
 * FitCore Gym Management System - Frontend App Logic
 */

// 1. App State
let appData = {
    members: [],
    trainers: [],
    assignments: [],
    plans: [],
    accounts: [],
    payments: []
};

const API_BASE = 'http://localhost:5000/api';

// Simple ID Generator (fallback)
const generateId = (prefix) => prefix + Math.floor(Math.random() * 10000).toString().padStart(4, '0');

// 2. Navigation & UI State
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initMobileMenu();
    fetchInitialData();
    setupFormListeners();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');
    const pageTitle = document.getElementById('pageTitle');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(section => section.classList.remove('active'));
            
            item.classList.add('active');
            
            const viewId = item.getAttribute('data-view');
            document.getElementById(viewId).classList.add('active');
            
            pageTitle.innerText = item.querySelector('span').innerText;

            if(window.innerWidth <= 768) {
                document.getElementById('sidebar').classList.remove('open');
            }
        });
    });
}

function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const closeSidebar = document.getElementById('closeSidebar');
    const sidebar = document.getElementById('sidebar');

    menuToggle.addEventListener('click', () => {
        sidebar.classList.add('open');
    });

    closeSidebar.addEventListener('click', () => {
        sidebar.classList.remove('open');
    });
}

window.toggleForm = function(containerId) {
    const container = document.getElementById(containerId);
    if(container.style.display === 'none') {
        container.style.display = 'block';
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
        container.style.display = 'none';
    }
};

// 3. API Integration Logic
async function fetchInitialData() {
    try {
        const [membersRes, trainersRes, plansRes, paymentsRes, assignmentsRes, accountsRes] = await Promise.all([
            fetch(`${API_BASE}/members`),
            fetch(`${API_BASE}/trainers`),
            fetch(`${API_BASE}/plans`),
            fetch(`${API_BASE}/payments`),
            fetch(`${API_BASE}/assignments`),
            fetch(`${API_BASE}/accounts`)
        ]);
        
        appData.members = await membersRes.json();
        appData.trainers = await trainersRes.json();
        appData.plans = await plansRes.json();
        appData.payments = await paymentsRes.json();
        appData.assignments = await assignmentsRes.json();
        appData.accounts = await accountsRes.json();
        
        // Populate UI
        renderAllViews();
    } catch (error) {
        console.error("Error fetching data:", error);
        alert("Failed to connect to the backend API.");
    }
}

function renderAllViews() {
    renderDashboard();
    renderMembers();
    renderTrainers();
    renderAssignments();
    renderPlans();
    renderAccounts();
    renderPayments();
    populateSelectDropdowns();
}

const getMemberName = (id) => appData.members.find(m => m.member_id === id)?.name || 'Unknown';
const getTrainerName = (id) => appData.trainers.find(t => t.trainer_id === id)?.name || 'Unknown';
const getPlanName = (id) => appData.plans.find(p => p.plan_id === id)?.name || 'Unknown';

function renderDashboard() {
    document.getElementById('stat-members').innerText = appData.members.length;
    document.getElementById('stat-trainers').innerText = appData.trainers.length;
    
    const activeAccounts = appData.accounts.filter(a => a.status === 'Active').length;
    document.getElementById('stat-memberships').innerText = activeAccounts; // Still mocked data layer for bridging
    
    // Ensure amount is handled properly, APIs might return strings if DECIMAL
    const totalRev = appData.payments.filter(p => p.status === 'Paid' || p.status === 'Completed').reduce((sum, p) => sum + parseFloat(p.amount), 0);
    document.getElementById('stat-revenue').innerText = `$${totalRev.toFixed(0)}`;
}

// 4. REST Resource UI - Members
function renderMembers() {
    const tbody = document.querySelector('#members-table tbody');
    tbody.innerHTML = '';
    
    appData.members.forEach(member => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${member.member_id}</strong></td>
            <td>${member.name}</td>
            <td>${member.gender}</td>
            <td>${member.phone_no}</td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editMember(${member.member_id})"><i class="ph ph-pencil-simple"></i></button>
                <button class="btn btn-danger btn-sm" onclick="deleteMember(${member.member_id})"><i class="ph ph-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteMember = async function(id) {
    if(confirm('Are you sure you want to delete this member?')) {
        try {
            await fetch(`${API_BASE}/members/${id}`, { method: 'DELETE' });
            appData.members = appData.members.filter(m => m.member_id !== id);
            renderMembers();
            renderDashboard();
            populateSelectDropdowns();
        } catch(err) {
            console.error(err);
        }
    }
}

window.editMember = function(id) {
    alert(`Editing member ${id}. Implement PUT logic like Add!`);
}


function renderTrainers() {
    const tbody = document.querySelector('#trainers-table tbody');
    tbody.innerHTML = '';
    
    appData.trainers.forEach(trainer => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${trainer.trainer_id}</strong></td>
            <td>${trainer.name}</td>
            <td>${trainer.phone}</td>
            <td>${trainer.specialization}</td>
            <td>
                <button class="btn btn-secondary btn-sm"><i class="ph ph-pencil-simple"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function renderAssignments() {
    const tbody = document.querySelector('#assignments-table tbody');
    tbody.innerHTML = '';
    // Mock rendering for UI demo
    appData.assignments.forEach(assign => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${getTrainerName(assign.trainer_id)}</td>
            <td>${getMemberName(assign.member_id)}</td>
            <td>${assign.start_date}</td>
            <td>${assign.end_date}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="deleteAssignment(${assign.trainer_id}, ${assign.member_id})"><i class="ph ph-trash"></i></button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

window.deleteAssignment = async function(trainer_id, member_id) {
    if(confirm('Are you sure you want to delete this assignment?')) {
        try {
            await fetch(`${API_BASE}/assignments/${trainer_id}/${member_id}`, { method: 'DELETE' });
            appData.assignments = appData.assignments.filter(a => !(a.trainer_id === trainer_id && a.member_id === member_id));
            renderAssignments();
        } catch(err) {
            console.error(err);
        }
    }
}

function renderPlans() {
    const container = document.getElementById('plans-container');
    container.innerHTML = '';
    
    appData.plans.forEach(plan => {
        const div = document.createElement('div');
        div.className = 'card';
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                <h3 style="font-size: 1.25rem; font-weight: 600; color: var(--primary-color);">${plan.plan_name}</h3>
                <span class="badge-status badge-active">${plan.duration} Months</span>
            </div>
            <p style="font-size: 2rem; font-weight: 700; color: var(--secondary-color); margin-bottom: 1rem;">$${plan.fee}</p>
            <p style="color: var(--text-secondary); margin-bottom: 1rem; flex: 1;"><i class="ph ph-check-circle" style="color: var(--success); margin-right: 0.5rem;"></i>${plan.facilities}</p>
            <button class="btn btn-secondary" style="width: 100%;">Edit Plan</button>
        `;
        container.appendChild(div);
    });
}

function renderAccounts() {
    const tbody = document.querySelector('#accounts-table tbody');
    tbody.innerHTML = '';
    
    appData.accounts.forEach(acc => {
        const statusClass = acc.status === 'Active' ? 'badge-active' : 'badge-expired';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${acc.account_number}</strong></td>
            <td>${getMemberName(acc.member_id)}</td>
            <td>${getPlanName(acc.plan_id)}</td>
            <td>${acc.activation_date}</td>
            <td>${acc.expiry_date}</td>
            <td><span class="badge-status ${statusClass}">${acc.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function renderPayments() {
    const tbody = document.querySelector('#payments-table tbody');
    tbody.innerHTML = '';
    
    appData.payments.forEach(pay => {
        const statusClass = (pay.status === 'Completed' || pay.status === 'Paid') ? 'badge-active' : 'badge-pending';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${pay.payment_id}</strong></td>
            <td>${getMemberName(pay.member_id)}</td>
            <td>$${pay.amount}</td>
            <td>${new Date(pay.date).toLocaleDateString()}</td>
            <td>${pay.mode}</td>
            <td><span class="badge-status ${statusClass}">${pay.status}</span></td>
        `;
        tbody.appendChild(tr);
    });
}

function populateSelectDropdowns() {
    const populate = (selectId, dataArray, idKey, nameKey) => {
        const select = document.getElementById(selectId);
        if(!select) return;
        select.innerHTML = '<option value="">Select option...</option>';
        dataArray.forEach(item => {
            const opt = document.createElement('option');
            opt.value = item[idKey];
            opt.innerText = item[nameKey];
            select.appendChild(opt);
        });
    };

    populate('assign-trainer', appData.trainers, 'trainer_id', 'name');
    populate('assign-member', appData.members, 'member_id', 'name');
    
    populate('account-member', appData.members, 'member_id', 'name');
    populate('account-plan', appData.plans, 'plan_id', 'plan_name');
    
    populate('payment-member', appData.members, 'member_id', 'name');
}

// 5. Form Submissions to API
function setupFormListeners() {
    
    // Member POST
    const memberForm = document.getElementById('member-form');
    // Remove existing listener if any to prevent duplicates
    const newMemberForm = memberForm.cloneNode(true);
    memberForm.parentNode.replaceChild(newMemberForm, memberForm);
    
    newMemberForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const randId = Math.floor(Math.random() * 900) + 100;
        const member = {
            member_id: randId,
            name: document.getElementById('member-name').value,
            gender: document.getElementById('member-gender').value,
            phone_no: document.getElementById('member-phone').value,
        };
        
        try {
            const response = await fetch(`${API_BASE}/members`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(member)
            });
            
            if (response.ok) {
                appData.members.push(member);
                renderMembers();
                renderDashboard();
                populateSelectDropdowns();
                e.target.reset();
                window.toggleForm('member-form-container');
            } else {
                alert("Failed to save member on server.");
            }
        } catch(err) { 
            console.error('Error saving member', err);
            alert("Database connection error. Is MySQL running?");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });

    // Trainer POST
    const trainerForm = document.getElementById('trainer-form');
    const newTrainerForm = trainerForm.cloneNode(true);
    trainerForm.parentNode.replaceChild(newTrainerForm, trainerForm);

    newTrainerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const randId = Math.floor(Math.random() * 900) + 100;
        const trainer = {
            trainer_id: randId,
            name: document.getElementById('trainer-name').value,
            phone: document.getElementById('trainer-phone').value,
            specialization: document.getElementById('trainer-spec').value,
        };
        try {
            const response = await fetch(`${API_BASE}/trainers`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(trainer)
            });
            if (response.ok) {
                appData.trainers.push(trainer);
                renderTrainers();
                renderDashboard();
                populateSelectDropdowns();
                e.target.reset();
                window.toggleForm('trainer-form-container');
            } else {
                alert("Failed to save trainer.");
            }
        } catch(err) { 
            console.error('Error saving trainer', err);
            alert("Connection error.");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });

    // Assignment POST
    const assignmentForm = document.getElementById('assignment-form');
    const newAssignmentForm = assignmentForm.cloneNode(true);
    assignmentForm.parentNode.replaceChild(newAssignmentForm, assignmentForm);

    newAssignmentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const assignment = {
            trainer_id: parseInt(document.getElementById('assign-trainer').value),
            member_id: parseInt(document.getElementById('assign-member').value),
            start_date: document.getElementById('assign-start').value,
            end_date: document.getElementById('assign-end').value,
        };

        try {
            const response = await fetch(`${API_BASE}/assignments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(assignment)
            });
            if (response.ok) {
                appData.assignments.push(assignment);
                renderAssignments();
                e.target.reset();
                window.toggleForm('assignment-form-container');
            } else {
                alert("Failed to save assignment.");
            }
        } catch(err) {
            console.error('Error saving assignment', err);
            alert("Connection error.");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });

    // Plan POST
    const planForm = document.getElementById('plan-form');
    const newPlanForm = planForm.cloneNode(true);
    planForm.parentNode.replaceChild(newPlanForm, planForm);

    newPlanForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const randId = Math.floor(Math.random() * 90) + 10;
        const plan = {
            plan_id: randId,
            plan_name: document.getElementById('plan-name').value,
            duration: parseInt(document.getElementById('plan-duration').value),
            fee: parseFloat(document.getElementById('plan-fee').value),
            facilities: document.getElementById('plan-facilities').value,
        };
        try {
            const response = await fetch(`${API_BASE}/plans`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(plan)
            });
            if (response.ok) {
                appData.plans.push(plan);
                renderPlans();
                populateSelectDropdowns();
                e.target.reset();
                window.toggleForm('plan-form-container');
            } else {
                alert("Failed to save plan.");
            }
        } catch(err) { 
            console.error('Error saving plan', err);
            alert("Connection error.");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });

    // Account POST
    const accountForm = document.getElementById('account-form');
    const newAccountForm = accountForm.cloneNode(true);
    accountForm.parentNode.replaceChild(newAccountForm, accountForm);

    newAccountForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const planId = parseInt(document.getElementById('account-plan').value);
        const plan = appData.plans.find(p => p.plan_id === planId);
        
        const actDate = new Date(document.getElementById('account-activation').value);
        const expDate = new Date(actDate);
        expDate.setMonth(expDate.getMonth() + plan.duration);
        
        const account = {
            account_number: Math.floor(10000 + Math.random() * 90000),
            member_id: parseInt(document.getElementById('account-member').value),
            plan_id: planId,
            activation_date: actDate.toISOString().split('T')[0],
            expiry_date: expDate.toISOString().split('T')[0],
            status: 'Active'
        };

        try {
            const response = await fetch(`${API_BASE}/accounts`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(account)
            });
            if (response.ok) {
                appData.accounts.push(account);
                renderAccounts();
                renderDashboard();
                e.target.reset();
                window.toggleForm('account-form-container');
            } else {
                alert("Failed to create membership account.");
            }
        } catch(err) {
            console.error('Error saving account', err);
            alert("Connection error.");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });

    // Payment POST
    const paymentForm = document.getElementById('payment-form');
    const newPaymentForm = paymentForm.cloneNode(true);
    paymentForm.parentNode.replaceChild(newPaymentForm, paymentForm);

    newPaymentForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtn = e.target.querySelector('button[type="submit"]');
        if (saveBtn) saveBtn.disabled = true;

        const randId = Math.floor(Math.random() * 900) + 500;
        const payment = {
            payment_id: randId,
            member_id: parseInt(document.getElementById('payment-member').value),
            amount: parseFloat(document.getElementById('payment-amount').value),
            mode: document.getElementById('payment-mode').value,
            date: document.getElementById('payment-date').value,
            status: document.getElementById('payment-status').value,
        };
        try {
            const response = await fetch(`${API_BASE}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payment)
            });
            if (response.ok) {
                appData.payments.push(payment);
                renderPayments();
                renderDashboard();
                e.target.reset();
                window.toggleForm('payment-form-container');
            } else {
                alert("Failed to record payment.");
            }
        } catch(err) { 
            console.error('Error saving Payment', err);
            alert("Connection error.");
        } finally {
            if (saveBtn) saveBtn.disabled = false;
        }
    });
}
