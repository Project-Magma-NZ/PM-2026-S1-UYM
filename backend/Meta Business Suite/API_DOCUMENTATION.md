# API Documentation & Testing Summary

## 1. Overview

This document summarises the testing and usage of the mock Meta Business Suite API, including Facebook and Instagram endpoints. The testing focuses on validating data correctness, parameter-based filtering, and authentication.

---

## 2. Endpoints Tested

### Facebook

* `/fb_page`
* `/fb_page/insights`
* `/fb_page/demographics`

### Instagram

* `/me/instagram_account`
* `/ig_account/insights`
* `/ig_account/demographics`

---

## 3. Parameters

The API supports several parameters to control the returned data:

* `fields`: specify which fields to return (e.g., id, name)
* `metric`: specify which metrics to return (e.g., impressions, reach)
* `dimension`: specify demographic data (e.g., gender, age)

---

## 4. Example Usage & Responses

### Example 1: Field Filtering

Request:

```bash
/fb_page?fields=id,name&access_token=fake_token
```

Response:

```json
{
  "id": "...",
  "name": "..."
}
```

---

### Example 2: Metric Filtering

Request:

```bash
/ig_account/insights?metric=reach&access_token=fake_token
```

Response:

```json
{
  "data": [
    {
      "name": "reach",
      "values": [...]
    }
  ]
}
```

---

### Example 3: Dimension Filtering

Request:

```bash
/fb_page/demographics?dimension=gender&access_token=fake_token
```

Response:

```json
{
  "gender": {...}
}
```

---

## 5. Error Handling

Authentication was tested using both missing and invalid access tokens.

Example:

```bash
/ig_account/insights
```

Response:

```text
401 Unauthorized: Invalid/missing access_token
```

The API correctly returns a 401 error when authentication fails.

---

## 6. Testing Summary

All endpoints were tested successfully.

* Default responses return complete data
* Filtering parameters (`fields`, `metric`, `dimension`) work correctly
* Authentication is enforced consistently across endpoints

---

## 7. API Usage (For Frontend)🌟

The following examples show how frontend developers can use the API.
These endpoints are intended to be used programmatically (e.g., via fetch or axios in frontend applications), not manually through the browser.
---

### Facebook Page Info

```bash
/fb_page?access_token=fake_token
```

Optional:

```bash
/fb_page?fields=id,name&access_token=fake_token
```

---

### Facebook Insights

```bash
/fb_page/insights?access_token=fake_token
```

Optional:

```bash
/fb_page/insights?metric=page_reach&access_token=fake_token
```

---

### Facebook Demographics

```bash
/fb_page/demographics?access_token=fake_token
```

Optional:

```bash
/fb_page/demographics?dimension=gender&access_token=fake_token
```

---

### Instagram Account Info

```bash
/me/instagram_account?access_token=fake_token
```

---

### Instagram Insights

```bash
/ig_account/insights?access_token=fake_token
```

Optional:

```bash
/ig_account/insights?metric=reach&access_token=fake_token
```

---

### Instagram Demographics

```bash
/ig_account/demographics?access_token=fake_token
```

Optional:

```bash
/ig_account/demographics?dimension=age&access_token=fake_token
```

---

### Notes

* All requests require a valid `access_token`
* Responses are returned in JSON format
* Filtering parameters help reduce unnecessary data for frontend use

---

## 8. Conclusion
The mock API is fully functional and suitable for development, testing, and frontend integration before connecting to real Meta APIs.

## 9. Development Note
This mock API documentation is intended to support frontend integration and dashboard development during the prototype stage.
