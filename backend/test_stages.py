import os
import django
import json
from django.test import Client

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

client = Client()
for s in range(1, 9):
    res = client.post('/api/simulate-rainfall/', data=json.dumps({"stage": s}), content_type='application/json')
    data = res.json()
    print(f"Stage {s}: {data.get('stage_name')} | Status: {res.status_code} | Wards updated: {data.get('wards_updated')}")
