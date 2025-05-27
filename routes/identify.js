const express = require('express');
const router = express.Router();
const Contact = require('../models/Contact');

router.post('/', async (req, res) => {
  const { email, phoneNumber } = req.body;
  if (!email && !phoneNumber) return res.status(400).json({ error: 'Email or phone required' });

  try {
    const matches = await Contact.find({ $or: [{ email }, { phoneNumber }] });

    if (!matches.length) {
      const contact = await Contact.create({ email, phoneNumber });
      return res.json({
        contact: {
          primaryContactId: contact._id,
          emails: [contact.email],
          phoneNumbers: [contact.phoneNumber],
          secondaryContactIds: []
        }
      });
    }

    const primary = matches.reduce((a, b) => a.createdAt < b.createdAt ? a : b);
    const exact = matches.some(c => c.email === email && c.phoneNumber === phoneNumber);

    if (!exact) {
      await Contact.create({
        email,
        phoneNumber,
        linkedId: primary._id,
        linkPrecedence: 'secondary'
      });
    }

    const related = await Contact.find({
      $or: [
        { _id: primary._id },
        { linkedId: primary._id },
        { email },
        { phoneNumber }
      ]
    });

    const emails = [...new Set(related.map(c => c.email).filter(Boolean))];
    const phoneNumbers = [...new Set(related.map(c => c.phoneNumber).filter(Boolean))];
    const secondaryIds = related.filter(c => c.linkPrecedence === 'secondary').map(c => c._id);

    res.json({
      contact: {
        primaryContactId: primary._id,
        emails,
        phoneNumbers,
        secondaryContactIds: secondaryIds
      }
    });
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Something went wrong' });
  }
});

module.exports = router;
