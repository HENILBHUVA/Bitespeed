const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  try {
    console.log(" Request received:", req.body);

    const { email, phoneNumber } = req.body;

    if (!email && !phoneNumber) {
      return res.status(400).json({ error: 'Email or phone number required' });
    }

    // Step 1: Find all existing contacts with same email/phone
    const existingContacts = await Contact.find({
      $or: [{ email }, { phoneNumber }]
    });

    if (existingContacts.length === 0) {
      // Step 2: No contact exists, create new primary
      const newContact = await Contact.create({ email, phoneNumber });
      return res.json({
        contact: {
          primaryContactId: newContact._id,
          emails: [newContact.email],
          phoneNumbers: [newContact.phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    // Step 3: Find oldest (primary) contact
    const primary = existingContacts.reduce((oldest, contact) =>
      new Date(contact.createdAt) < new Date(oldest.createdAt) ? contact : oldest
    );

    // Step 4: Check if exact same contact already exists
    const contactAlreadyExists = existingContacts.some(c =>
      c.email === email && c.phoneNumber === phoneNumber
    );

    // Step 5: Create a secondary contact if it's a new email/phone
    if (!contactAlreadyExists) {
      await Contact.create({
        email,
        phoneNumber,
        linkedId: primary._id,
        linkPrecedence: 'secondary'
      });
    }

    // Step 6: Get all related contacts
    const allContacts = await Contact.find({
      $or: [
        { email },
        { phoneNumber },
        { linkedId: primary._id },
        { _id: primary._id }
      ]
    });

    // Step 7: Collect emails, phoneNumbers, and secondary IDs
    const emails = [...new Set(allContacts.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(allContacts.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = allContacts
      .filter(c => c.linkPrecedence === 'secondary')
      .map(c => c._id);

    // Step 8: Send response
    return res.json({
      contact: {
        primaryContactId: primary._id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
      }
    });

  } catch (error) {
    console.error("Error in /identify:", error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
