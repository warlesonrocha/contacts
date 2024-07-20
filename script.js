const contactList = document.getElementById('contact-list');
const photoSelect = document.getElementById('photo');
const nameInput = document.getElementById('name');
const phoneInput = document.getElementById('phone');
const addContactButton = document.getElementById('add-contact');
const removeContactButton = document.getElementById('remove-contact');
const editContactButton = document.getElementById('edit-contact');
let contacts = JSON.parse(localStorage.getItem('contacts')) || [];
let editIndex = null;

// SetAttribute
nameInput.setAttribute('maxlength', '25');
phoneInput.setAttribute('maxlength', '15');
phoneInput.addEventListener('input', (event) => {
    let v = event.target.value
    v = v.replace(/\D/g, '')
    v = v.replace(/^(\d{2})(\d)/g, '($1) $2')
    v = v.replace(/(\d)(\d{4})$/, '$1-$2')
    event.target.value = v
})

// ServiceWorker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
        .then(registration => {
            console.log('Service Worker registrado com sucesso:', registration);
        })
        .catch(error => {
            console.log('Falha ao registrar Service Worker:', error);
        });
}

Notification.requestPermission().then(function(permission) {
    if (permission === 'granted') {
      console.log('Notification permission granted.')
    } else {
      console.log('Unable to get permission to notify.')
    }
})

function sendNotification(title, message) {
    navigator.serviceWorker.ready.then(function(registration) {
      registration.showNotification(`${title}`, {
        body: message,
        icon: 'https://cdn-icons-png.flaticon.com/512/9840/9840100.png',
      })
    })
  }

// DOM - Crud
document.addEventListener('DOMContentLoaded', () => {
    const loadContacts = () => {
        contactList.innerHTML = '';
        contacts.forEach((contact, index) => {
            addContactToDOM(contact, index);
        });
    };

    const addContactToDOM = (contact, index) => {
        const li = document.createElement('li');
        li.classList.add('contact-item');
        li.dataset.index = index;
        li.innerHTML = `
            <img src="${contact.photo}" alt="${contact.name}">
            <span>${contact.name}</span>
            <span> - </span>
            <span>${contact.phone}</span>
        `;
        contactList.appendChild(li);
    };

    const saveContact = (contact, index) => {
        if (index !== null) {
            contacts[index] = contact;
        } else {
            contacts.push(contact);
        }
        localStorage.setItem('contacts', JSON.stringify(contacts));
        loadContacts();
    };

    const showAlert = (message) => {
        alert(message);
    };

    addContactButton.addEventListener('click', () => {
        const photo = photoSelect.value;
        const name = nameInput.value.trim();
        const phone = phoneInput.value.trim();

        if (!name || !phone) {
            showAlert('Nome e telefone são obrigatórios.');
            return;
        }

        const contact = {
            photo: photo,
            name: name,
            phone: phone
        };
        saveContact(contact, editIndex);
        photoSelect.value = 'disabled';
        nameInput.value = '';
        phoneInput.value = '';
        editIndex = null;
        showAlert('Contato adicionado/atualizado com sucesso.');
        sendNotification('Contato adicionado/atualizado');
    });

    removeContactButton.addEventListener('click', () => {
        const name = prompt('Digite o nome do contato a ser removido:');
        if (name) {
            const [firstName, lastName] = name.split(' ');
            const initialLength = contacts.length;
            contacts = contacts.filter(contact => {
                const [contactFirstName] = contact.name.split(' ');
                return contactFirstName !== firstName || (lastName && contact.name.split(' ')[1] !== lastName);
            });
            if (contacts.length < initialLength) {
                localStorage.setItem('contacts', JSON.stringify(contacts));
                loadContacts();
                showAlert('Contato removido com sucesso.');
                sendNotification('Contato removido');
            } else {
                showAlert('Contato não encontrado.');
                sendNotification('Contato não encontrado');
            }
        }
    });

    editContactButton.addEventListener('click', () => {
        const name = prompt('Digite o nome do contato a ser editado:');
        if (name) {
            const contactToEdit = contacts.find(contact => contact.name === name);
            if (contactToEdit) {
                nameInput.value = contactToEdit.name;
                phoneInput.value = contactToEdit.phone;
                photoSelect.value = contactToEdit.photo;
                editIndex = contacts.indexOf(contactToEdit);
                showAlert('Você pode editar as informações do contato.');
            } else {
                showAlert('Contato não encontrado.');
            }
        }
    });

    loadContacts();
});

