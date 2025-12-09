#!/bin/bash

echo "🧪 TEST INSTRUCTOR MANAGEMENT API"
echo "=================================="
echo ""

API_BASE="http://localhost:8080/api/instructors"

echo "✅ Test 1: GET all instructors"
curl -s $API_BASE | jq '.'
echo ""
echo ""

echo "✅ Test 2: CREATE new instructor"
RESPONSE=$(curl -s -X POST $API_BASE \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test Instructor",
    "email": "test_instructor_'$(date +%s)'@test.com",
    "phone": "0987654321",
    "specialization": "IELTS",
    "level": "Senior",
    "experience_years": 5,
    "hourly_rate": 150000,
    "bio": "Test bio",
    "note": "Test note",
    "status": "NEW"
  }')

echo $RESPONSE | jq '.'
INSTRUCTOR_ID=$(echo $RESPONSE | jq -r '.id')
echo ""
echo "Created instructor ID: $INSTRUCTOR_ID"
echo ""
echo ""

if [ ! -z "$INSTRUCTOR_ID" ] && [ "$INSTRUCTOR_ID" != "null" ]; then
  echo "✅ Test 3: GET instructor detail"
  curl -s "$API_BASE/$INSTRUCTOR_ID" | jq '.'
  echo ""
  echo ""

  echo "✅ Test 4: UPDATE instructor"
  curl -s -X PUT "$API_BASE/$INSTRUCTOR_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "status": "ACTIVE",
      "hourly_rate": 200000,
      "note": "Updated note"
    }' | jq '.'
  echo ""
  echo ""

  echo "✅ Test 5: GET instructors with status=ACTIVE"
  curl -s "$API_BASE?status=ACTIVE" | jq '.'
  echo ""
  echo ""

  echo "✅ Test 6: Search instructors"
  curl -s "$API_BASE?keyword=Test" | jq '.'
  echo ""
  echo ""

  echo "⚠️  Test 7: DELETE instructor (should work if no active classes)"
  curl -s -X DELETE "$API_BASE/$INSTRUCTOR_ID" | jq '.'
  echo ""
  echo ""

  echo "✅ Test 8: Verify deletion"
  curl -s "$API_BASE/$INSTRUCTOR_ID" | jq '.'
  echo ""
fi

echo ""
echo "🎉 TEST COMPLETED"
