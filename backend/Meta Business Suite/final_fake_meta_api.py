from flask import Flask, jsonify, request, abort

app = Flask(__name__)

FAKE_TOKEN = "fake_token"

# fake Facebook and Instagram page info
FACEBOOK_PAGE = {
    "id": "123456789012345",
    "name": "Upside Youth Mentoring",
    "fan_count": 1482,
    "followers_count": 1503,
    "website": "https://upside.org.nz/"
}

INSTAGRAM_ACCOUNT = {
    "id": "ig_account",
    "username": "upside_youth_mentoring",
    "name": "Upside Youth Mentoring",
    "followers_count": 847,
    "follows_count": 312,
    "media_count": 94
}

# fake auth for now
def require_token():
    token = request.args.get("access_token")
    if token != FAKE_TOKEN:
        abort(401, description="Invalid/missing access_token")


def pick_fields(source, fields_param):
    if not fields_param:
        return source
    fields = [f.strip() for f in fields_param.split(",")]
    return {k: v for k, v in source.items() if k in fields}


# --- Facebook Page profile endpoints ---

@app.route("/fb_page")
def page_info():
    require_token()
    fields = request.args.get("fields")
    return jsonify(pick_fields(FACEBOOK_PAGE, fields))


@app.route("/fb_page/insights")
def page_insights():
    require_token()
    metric_param = request.args.get("metric", "page_impressions,page_reach,page_fans")
    metrics = [m.strip() for m in metric_param.split(",")]

    values_map = {
        "page_impressions": [
            {"value": 620, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 670, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 640, "end_time": "2026-04-12T07:00:00+0000"}
        ],
        "page_reach": [
            {"value": 480, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 510, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 495, "end_time": "2026-04-12T07:00:00+0000"}
        ],
        "page_fans": [
            {"value": 1480, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 1488, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 1492, "end_time": "2026-04-12T07:00:00+0000"}
        ],
        "page_engaged_users": [
            {"value": 80, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 92, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 88, "end_time": "2026-04-12T07:00:00+0000"}
        ]
    }

    data = []
    for metric in metrics:
        data.append({
            "id": f"{FACEBOOK_PAGE['id']}/insights/{metric}/day",
            "name": metric,
            "period": "day",
            "values": values_map.get(metric, []),
            "title": metric.replace("_", " ").title()
        })

    return jsonify({"data": data})


@app.route("/fb_page/demographics")
def facebook_demographics():
    require_token()
    dimension_param = request.args.get("dimension", "gender,age,location")
    dimensions = [d.strip() for d in dimension_param.split(",")]

    demographics_map = {
        "gender": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {"female": 320, "male": 210, "unknown": 15}
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {"female": 335, "male": 218, "unknown": 14}
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {"female": 340, "male": 225, "unknown": 16}
            }
        ],
        "age": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {
                    "13-17": 45,
                    "18-24": 120,
                    "25-34": 210,
                    "35-44": 140,
                    "45-54": 95,
                    "55+": 40
                }
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {
                    "13-17": 48,
                    "18-24": 125,
                    "25-34": 220,
                    "35-44": 145,
                    "45-54": 92,
                    "55+": 42
                }
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {
                    "13-17": 50,
                    "18-24": 128,
                    "25-34": 230,
                    "35-44": 150,
                    "45-54": 96,
                    "55+": 44
                }
            }
        ],
        "location": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {
                    "Auckland": 410,
                    "Wellington": 90,
                    "Christchurch": 75,
                    "Hamilton": 40,
                    "Other": 60
                }
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {
                    "Auckland": 425,
                    "Wellington": 95,
                    "Christchurch": 78,
                    "Hamilton": 42,
                    "Other": 58
                }
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {
                    "Auckland": 430,
                    "Wellington": 97,
                    "Christchurch": 82,
                    "Hamilton": 43,
                    "Other": 60
                }
            }
        ]
    }

    data = []
    for dimension in dimensions:
        data.append({
            "id": f"{FACEBOOK_PAGE['id']}/demographics/{dimension}/day",
            "dimension": dimension,
            "period": "day",
            "values": demographics_map.get(dimension, [])
        })

    return jsonify({"data": data})


# --- Instagram profile endpoints ---

@app.route("/me/instagram_account")
def instagram_accounts():
    require_token()
    return jsonify({
        "data": [{
            "id": INSTAGRAM_ACCOUNT["id"],
            "username": INSTAGRAM_ACCOUNT["username"],
            "name": INSTAGRAM_ACCOUNT["name"]
        }]
    })


IG_ID = INSTAGRAM_ACCOUNT["id"]


@app.route(f"/{IG_ID}/insights")
def instagram_insights():
    require_token()
    metric_param = request.args.get("metric", "impressions,reach,follower_count")
    metrics = [m.strip() for m in metric_param.split(",")]

    values_map = {
        "impressions": [
            {"value": 310, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 330, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 320, "end_time": "2026-04-12T07:00:00+0000"}
        ],
        "reach": [
            {"value": 240, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 255, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 250, "end_time": "2026-04-12T07:00:00+0000"}
        ],
        "follower_count": [
            {"value": 845, "end_time": "2026-04-10T07:00:00+0000"},
            {"value": 847, "end_time": "2026-04-11T07:00:00+0000"},
            {"value": 849, "end_time": "2026-04-12T07:00:00+0000"}
        ]
    }

    data = []
    for metric in metrics:
        data.append({
            "id": f"{INSTAGRAM_ACCOUNT['id']}/insights/{metric}/day",
            "name": metric,
            "period": "day",
            "values": values_map.get(metric, []),
            "title": metric.replace("_", " ").title()
        })

    return jsonify({"data": data})


@app.route(f"/{IG_ID}/demographics")
def instagram_demographics():
    require_token()
    dimension_param = request.args.get("dimension", "gender,age,location")
    dimensions = [d.strip() for d in dimension_param.split(",")]

    demographics_map = {
        "gender": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {"female": 180, "male": 120, "unknown": 8}
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {"female": 188, "male": 126, "unknown": 7}
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {"female": 190, "male": 130, "unknown": 9}
            }
        ],
        "age": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {
                    "13-17": 30,
                    "18-24": 85,
                    "25-34": 140,
                    "35-44": 90,
                    "45-54": 50,
                    "55+": 20
                }
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {
                    "13-17": 32,
                    "18-24": 88,
                    "25-34": 145,
                    "35-44": 92,
                    "45-54": 52,
                    "55+": 21
                }
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {
                    "13-17": 34,
                    "18-24": 90,
                    "25-34": 150,
                    "35-44": 95,
                    "45-54": 53,
                    "55+": 22
                }
            }
        ],
        "location": [
            {
                "end_time": "2026-04-10T07:00:00+0000",
                "value": {
                    "Auckland": 250,
                    "Wellington": 45,
                    "Christchurch": 35,
                    "Hamilton": 18,
                    "Other": 22
                }
            },
            {
                "end_time": "2026-04-11T07:00:00+0000",
                "value": {
                    "Auckland": 258,
                    "Wellington": 47,
                    "Christchurch": 38,
                    "Hamilton": 19,
                    "Other": 24
                }
            },
            {
                "end_time": "2026-04-12T07:00:00+0000",
                "value": {
                    "Auckland": 262,
                    "Wellington": 49,
                    "Christchurch": 39,
                    "Hamilton": 20,
                    "Other": 25
                }
            }
        ]
    }

    data = []
    for dimension in dimensions:
        data.append({
            "id": f"{INSTAGRAM_ACCOUNT['id']}/demographics/{dimension}/day",
            "dimension": dimension,
            "period": "day",
            "values": demographics_map.get(dimension, [])
        })

    return jsonify({"data": data})


@app.errorhandler(401)
def handle_401(e):
    return jsonify({"error": {"message": str(e)}}), 401


@app.errorhandler(404)
def handle_404(e):
    return jsonify({"error": {"message": "Unsupported endpoint"}}), 404


@app.route("/")
def home():
    return {
        "message": "Fake Meta API is running",
        "endpoints": [
            "/fb_page",
            "/fb_page/insights",
            "/fb_page/demographics",
            "/me/instagram_account",
            "/ig_account/insights",
            "/ig_account/demographics"
        ]
    }

if __name__ == "__main__":
    print(app.url_map)
    print("Fake Meta API running: http://localhost:3001")
    print("Use access_token=fake_token")
    print("Available Endpoints:")
    print("  GET /fb_page")
    print("  GET /fb_page/insights")
    print("  GET /fb_page/demographics")
    print("  GET /me/instagram_account")
    print("  GET /ig_account/insights")
    print("  GET /ig_account/demographics")
    app.run(port=3001, debug=True)