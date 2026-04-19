# Fake Meta Business Suite API

This is a simple mock API that simulates Facebook and Instagram endpoints.

It is designed for testing the integration of Meta API functionality with a frontend application, without requiring real Meta API access.

---

## Running the File / Server

1. Install (or check if installed) Flask on your machine:
   - `pip install flask`

2. Run the script:
   - `python final_fake_meta_api.py`

3. The server will start at:
   - `http://localhost:3001`

---

## Authentication

All endpoints require a fake (temporary) access token:

- `access_token=fake_token`

---

## Available Endpoints

### For Facebook

#### 1. Get Facebook Page Info

http://localhost:3001/fb_page?access_token=fake_token

##### Optional: specify fields (id, name, fan_count, followers_count, website)

http://localhost:3001/fb_page?fields=id,name,fan_count,followers_count,website&access_token=fake_token

---

#### 2. Get Facebook Page Insights

http://localhost:3001/fb_page/insights?access_token=fake_token

##### Optional: specify metrics (page_impressions, page_reach, page_fans, page_engaged_users)

http://localhost:3001/fb_page/insights?metric=page_impressions,page_reach,page_fans,page_engaged_users&access_token=fake_token

---

#### 3. Get Facebook Demographics (gender, age, location)

http://localhost:3001/fb_page/demographics?access_token=fake_token

##### Optional: specify dimensions (gender, age, location)

http://localhost:3001/fb_page/demographics?dimension=gender,age,location&access_token=fake_token

---

### For Instagram

#### 1. Get Instagram Account Info

http://localhost:3001/me/instagram_account?access_token=fake_token

---

#### 2. Get Instagram Insights

http://localhost:3001/ig_account/insights?access_token=fake_token

##### Optional: specify metrics (impressions, reach, follower_count)

http://localhost:3001/ig_account/insights?metric=impressions,reach,follower_count&access_token=fake_token

---

#### 3. Get Instagram Demographics (gender, age, location)

http://localhost:3001/ig_account/demographics?access_token=fake_token

##### Optional: specify dimensions (gender, age, location)

http://localhost:3001/ig_account/demographics?dimension=gender,age,location&access_token=fake_token

---

## Notes

- All data returned by this API is **mock (fake) data**
- The API does **not connect to Meta services**
- Intended for **development and testing purposes only**