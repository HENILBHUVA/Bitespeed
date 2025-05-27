# Contact Identification API

This project exposes a `/identify` POST endpoint to identify contacts based on email or phone number, linking secondary contacts.

## How to Use

### POST /identify

- URL: `https://bitespeed-cxdj.onrender.com`
- Content-Type: `application/json`
- Request body example:

```json
{
  "email": "henil@gmail.com",
  "phoneNumber": "1234567890"
}
