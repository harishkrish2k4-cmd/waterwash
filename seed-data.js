import { db } from './js/firebase-config.js';
import { collection, doc, setDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

const initialServices = [
    {
        name: 'Bike Wash',
        price: 100,
        description: 'Complete bike cleaning including body wash, chain cleaning, and polish. Your bike will shine like new!',
        features: ['Full body wash', 'Chain cleaning & lubrication', 'Dashboard polish', 'Tire shine'],
        icon: 'fas fa-motorcycle',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    },
    {
        name: 'Car Wash',
        price: 500,
        description: 'Premium car wash service including exterior wash, interior cleaning, and detailing. Drive away in a spotless car!',
        features: ['Exterior body wash', 'Interior vacuuming', 'Dashboard & console cleaning', 'Window cleaning', 'Tire shine & polish'],
        icon: 'fas fa-car',
        gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
    },
    {
        name: 'Engine Cleaning',
        price: 300,
        description: 'Deep cleaning of the engine bay to remove grease, dirt, and grime. Prevents overheating and looks great!',
        features: ['Degreasing', 'High-pressure steam cleaning', 'Protective coating', 'Safety check'],
        icon: 'fas fa-cogs',
        gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)'
    },
    {
        name: 'Ceramic Coating',
        price: 2500,
        description: 'Advanced nano-ceramic coating for long-lasting protection, extreme gloss, and water repellency.',
        features: ['9H Hardness', 'UV protection', 'Hydrophobic effect', '2-year durability'],
        icon: 'fas fa-shield-alt',
        gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
    },
    {
        name: 'Interior Detailing',
        price: 800,
        description: 'Thorough interior cleaning including seats, carpets, dashboard, and ceiling. Restore that new car smell!',
        features: ['Deep extraction', 'Leather conditioning', 'Stain removal', 'Odor neutralization'],
        icon: 'fas fa-chair',
        gradient: 'linear-gradient(135deg, #16d9e3 0%, #30c7ec 47%, #46aef7 100%)'
    }
];

const initialMembershipPlans = {
    monthly: {
        name: 'Monthly Membership',
        price: 29,
        period: 'per month',
        features: [
            'Basic vehicle servicing',
            'Oil change included',
            'Emergency roadside assistance',
            'Priority booking',
            'Free vehicle wash',
            '10% discount on parts'
        ],
        recommended: false,
        icon: 'fas fa-calendar-alt'
    },
    halfYearly: {
        name: 'Half-Yearly Membership',
        price: 149,
        period: 'per 6 months',
        features: [
            'All monthly benefits',
            'Free tire rotation',
            'Battery check & service',
            'AC system inspection',
            'Priority service',
            '15% discount on parts',
            'Free towing service'
        ],
        recommended: true,
        icon: 'fas fa-star'
    },
    yearly: {
        name: 'Yearly Membership',
        price: 269,
        period: 'per year',
        features: [
            'All half-yearly benefits',
            'Full vehicle maintenance',
            'Free comprehensive inspections',
            'Brake system service',
            'Premium 24/7 support',
            '20% discount on parts',
            'Free pickup & delivery',
            'Complimentary detailing'
        ],
        recommended: false,
        icon: 'fas fa-crown'
    },
    ultimate: {
        name: 'Ultimate Membership',
        price: 499,
        period: 'per year',
        features: [
            'All Yearly benefits',
            'Monthly full detailing',
            'Engine wash every quarter',
            'Ceramic coating top-up',
            '24/7 Concierge service',
            '30% discount on all spare parts',
            'Unlimited roadside assistance'
        ],
        recommended: false,
        icon: 'fas fa-gem'
    }
};

async function seedData() {
    console.log('Starting seed...');

    // Seed Services
    for (const service of initialServices) {
        const serviceId = service.name.toLowerCase().replace(/\s+/g, '-');
        await setDoc(doc(db, 'services', serviceId), {
            ...service,
            createdAt: serverTimestamp()
        });
        console.log(`Seeded service: ${service.name}`);
    }

    // Seed Membership Plans
    for (const [id, plan] of Object.entries(initialMembershipPlans)) {
        await setDoc(doc(db, 'membershipPlans', id), {
            ...plan,
            id: id,
            createdAt: serverTimestamp()
        });
        console.log(`Seeded plan: ${plan.name}`);
    }

    console.log('Seeding complete!');
    alert('Seeding complete! You can now delete this file.');
}

seedData();
