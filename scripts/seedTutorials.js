
import mongoose from 'mongoose';
import { Tutorial } from './models/Tutorial.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleTutorials = [
  {
    title: "Arduino Temperature Sensor with DHT22",
    description: "Learn how to read temperature and humidity data using DHT22 sensor with Arduino. This tutorial covers wiring, code implementation, and data visualization through serial monitor.",
    category: "sensor",
    difficulty: "beginner",
    components: ["Arduino Uno", "DHT22 Sensor", "Breadboard", "Jumper Wires", "10kΩ Resistor"],
    codeSnippet: `#include <DHT.h>

#define DHT_PIN 2
#define DHT_TYPE DHT22

DHT dht(DHT_PIN, DHT_TYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
  Serial.println("DHT22 Temperature & Humidity Sensor");
}

void loop() {
  delay(2000);
  
  float humidity = dht.readHumidity();
  float temperature = dht.readTemperature();
  
  if (isnan(humidity) || isnan(temperature)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  
  Serial.print("Humidity: ");
  Serial.print(humidity);
  Serial.print("%  Temperature: ");
  Serial.print(temperature);
  Serial.println("°C");
}`,
    estimatedTime: "45 minutes",
    author: "Knowledge Garden Team",
    tags: ["arduino", "temperature", "humidity", "dht22", "beginner"]
  },
  {
    title: "ESP32 WiFi Weather Station",
    description: "Build a complete weather station using ESP32 that connects to WiFi and sends sensor data to a web server. Includes real-time monitoring and data logging capabilities.",
    category: "communication",
    difficulty: "intermediate",
    components: ["ESP32 Dev Board", "BME280 Sensor", "OLED Display", "Breadboard", "Jumper Wires"],
    codeSnippet: `#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <Adafruit_BME280.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverURL = "http://your-server.com/api/weather";

Adafruit_BME280 bme;

void setup() {
  Serial.begin(115200);
  
  // Initialize BME280
  if (!bme.begin(0x76)) {
    Serial.println("Could not find BME280 sensor!");
    while (1);
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  Serial.println("Connected to WiFi!");
}

void loop() {
  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    http.begin(serverURL);
    http.addHeader("Content-Type", "application/json");
    
    // Read sensor data
    float temp = bme.readTemperature();
    float humidity = bme.readHumidity();
    float pressure = bme.readPressure() / 100.0F;
    
    // Create JSON payload
    DynamicJsonDocument doc(1024);
    doc["temperature"] = temp;
    doc["humidity"] = humidity;
    doc["pressure"] = pressure;
    doc["timestamp"] = millis();
    
    String payload;
    serializeJson(doc, payload);
    
    // Send POST request
    int httpResponseCode = http.POST(payload);
    if (httpResponseCode > 0) {
      Serial.println("Data sent successfully!");
    }
    
    http.end();
  }
  
  delay(30000); // Send data every 30 seconds
}`,
    estimatedTime: "2 hours",
    author: "Knowledge Garden Team",
    tags: ["esp32", "wifi", "weather", "iot", "web-server", "json"]
  },
  {
    title: "Smart Home Automation with Relay Control",
    description: "Create a smart home system that controls lights and appliances using relays. Includes mobile app control via Blynk platform and voice command integration.",
    category: "automation",
    difficulty: "intermediate",
    components: ["NodeMCU ESP8266", "4-Channel Relay Module", "AC Bulbs", "Jumper Wires", "Power Supply"],
    codeSnippet: `#define BLYNK_PRINT Serial
#include <ESP8266WiFi.h>
#include <BlynkSimpleEsp8266.h>

char auth[] = "YOUR_BLYNK_AUTH_TOKEN";
char ssid[] = "YOUR_WIFI_SSID";
char pass[] = "YOUR_WIFI_PASSWORD";

// Relay pins
#define RELAY1 D1
#define RELAY2 D2
#define RELAY3 D3
#define RELAY4 D4

void setup() {
  Serial.begin(9600);
  
  // Initialize relay pins
  pinMode(RELAY1, OUTPUT);
  pinMode(RELAY2, OUTPUT);
  pinMode(RELAY3, OUTPUT);
  pinMode(RELAY4, OUTPUT);
  
  // Turn off all relays initially
  digitalWrite(RELAY1, HIGH);
  digitalWrite(RELAY2, HIGH);
  digitalWrite(RELAY3, HIGH);
  digitalWrite(RELAY4, HIGH);
  
  Blynk.begin(auth, ssid, pass);
}

void loop() {
  Blynk.run();
}

// Virtual pin handlers for Blynk app
BLYNK_WRITE(V1) {
  int pinValue = param.asInt();
  digitalWrite(RELAY1, !pinValue); // Relay is active LOW
  Serial.println("Living Room Light: " + String(pinValue ? "ON" : "OFF"));
}

BLYNK_WRITE(V2) {
  int pinValue = param.asInt();
  digitalWrite(RELAY2, !pinValue);
  Serial.println("Bedroom Light: " + String(pinValue ? "ON" : "OFF"));
}

BLYNK_WRITE(V3) {
  int pinValue = param.asInt();
  digitalWrite(RELAY3, !pinValue);
  Serial.println("Kitchen Light: " + String(pinValue ? "ON" : "OFF"));
}

BLYNK_WRITE(V4) {
  int pinValue = param.asInt();
  digitalWrite(RELAY4, !pinValue);
  Serial.println("Fan: " + String(pinValue ? "ON" : "OFF"));
}`,
    estimatedTime: "3 hours",
    author: "Knowledge Garden Team",
    tags: ["nodemcu", "relay", "home-automation", "blynk", "smart-home", "wifi"]
  },
    {
    title: "AI-Powered Plant Monitoring System",
    description: "Build an intelligent plant care system using machine learning to predict watering schedules. Includes soil moisture sensors, camera module for plant health analysis, and automated watering.",
    category: "ai-ml",
    difficulty: "advanced",
    components: ["Raspberry Pi 4", "Soil Moisture Sensor", "Camera Module", "Water Pump", "Relay Module", "DHT22 Sensor"],
    codeSnippet: `import cv2
import numpy as np
import RPi.GPIO as GPIO
import time
from datetime import datetime
import sqlite3

# GPIO Setup
MOISTURE_PIN = 18
PUMP_RELAY = 24
DHT_PIN = 4

GPIO.setmode(GPIO.BCM)
GPIO.setup(PUMP_RELAY, GPIO.OUT)

class PlantMonitor:
    def __init__(self):
        self.camera = cv2.VideoCapture(0)
        self.db_conn = sqlite3.connect('plant_data.db')
        self.setup_database()
    
    def setup_database(self):
        cursor = self.db_conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS sensor_data (
                timestamp TEXT,
                moisture REAL,
                temperature REAL,
                humidity REAL,
                plant_health TEXT
            )
        ''')
        self.db_conn.commit()
    
    def read_moisture(self):
        # Read analog value from moisture sensor
        return GPIO.input(MOISTURE_PIN)
    
    def analyze_plant_health(self):
        ret, frame = self.camera.read()
        if ret:
            # Simple color analysis for plant health
            hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
            green_mask = cv2.inRange(hsv, (40, 40, 40), (80, 255, 255))
            green_ratio = np.sum(green_mask) / (frame.shape[0] * frame.shape[1])
            
            if green_ratio > 0.3:
                return "Healthy"
            elif green_ratio > 0.15:
                return "Fair"
            else:
                return "Poor"
        return "Unknown"
    
    def water_plant(self, duration=5):
        print("Watering plant...")
        GPIO.output(PUMP_RELAY, GPIO.HIGH)
        time.sleep(duration)
        GPIO.output(PUMP_RELAY, GPIO.LOW)
        print("Watering complete")
    
    def monitor_and_decide(self):
        moisture = self.read_moisture()
        plant_health = self.analyze_plant_health()
        
        # AI decision making (simplified)
        if moisture < 30 and plant_health in ["Fair", "Poor"]:
            self.water_plant()
        
        # Log data
        cursor = self.db_conn.cursor()
        cursor.execute('''
            INSERT INTO sensor_data VALUES (?, ?, ?, ?, ?)
        ''', (datetime.now().isoformat(), moisture, 25.0, 60.0, plant_health))
        self.db_conn.commit()

# Main execution
monitor = PlantMonitor()
while True:
    monitor.monitor_and_decide()
    time.sleep(3600)  # Check every hour`,
    estimatedTime: "4 hours",
    author: "Knowledge Garden Team",
    tags: ["raspberry-pi", "ai", "machine-learning", "plant-care", "computer-vision", "automation"]
  },
  {
    title: "Bluetooth Controlled Robot Car",
    description: "Build a smartphone-controlled robot car using Arduino and Bluetooth module. Features include obstacle avoidance, speed control, and LED indicators for direction.",
    category: "robotics", 
    difficulty: "intermediate",
    components: ["Arduino Uno", "HC-05 Bluetooth Module", "L298N Motor Driver", "DC Motors", "Ultrasonic Sensor", "LEDs", "Chassis"],
    codeSnippet: `#include <SoftwareSerial.h>

SoftwareSerial bluetooth(2, 3); // RX, TX

// Motor pins
#define ENA 9
#define IN1 4
#define IN2 5
#define ENB 10
#define IN3 6
#define IN4 7

// Ultrasonic sensor
#define TRIG_PIN 8
#define ECHO_PIN 12

// LED pins
#define LED_FRONT 11
#define LED_BACK 13

int speed = 150; // Default speed

void setup() {
  Serial.begin(9600);
  bluetooth.begin(9600);
  
  // Motor pins
  pinMode(ENA, OUTPUT);
  pinMode(IN1, OUTPUT);
  pinMode(IN2, OUTPUT);
  pinMode(ENB, OUTPUT);
  pinMode(IN3, OUTPUT);
  pinMode(IN4, OUTPUT);
  
  // Sensor pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // LED pins
  pinMode(LED_FRONT, OUTPUT);
  pinMode(LED_BACK, OUTPUT);
  
  stopCar();
}

void loop() {
  if (bluetooth.available()) {
    char command = bluetooth.read();
    executeCommand(command);
  }
  
  // Obstacle avoidance
  if (getDistance() < 20) {
    stopCar();
    digitalWrite(LED_BACK, HIGH);
    delay(500);
    digitalWrite(LED_BACK, LOW);
  }
}

void executeCommand(char cmd) {
  switch(cmd) {
    case 'F': moveForward(); break;
    case 'B': moveBackward(); break;
    case 'L': turnLeft(); break;
    case 'R': turnRight(); break;
    case 'S': stopCar(); break;
    case '1': speed = 100; break;
    case '2': speed = 150; break;
    case '3': speed = 200; break;
    case '4': speed = 255; break;
  }
}

void moveForward() {
  digitalWrite(LED_FRONT, HIGH);
  digitalWrite(LED_BACK, LOW);
  
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void moveBackward() {
  digitalWrite(LED_FRONT, LOW);
  digitalWrite(LED_BACK, HIGH);
  
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void turnLeft() {
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, HIGH);
  digitalWrite(IN3, HIGH);
  digitalWrite(IN4, LOW);
}

void turnRight() {
  analogWrite(ENA, speed);
  analogWrite(ENB, speed);
  digitalWrite(IN1, HIGH);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, HIGH);
}

void stopCar() {
  digitalWrite(LED_FRONT, LOW);
  digitalWrite(LED_BACK, LOW);
  
  analogWrite(ENA, 0);
  analogWrite(ENB, 0);
  digitalWrite(IN1, LOW);
  digitalWrite(IN2, LOW);
  digitalWrite(IN3, LOW);
  digitalWrite(IN4, LOW);
}

long getDistance() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  long duration = pulseIn(ECHO_PIN, HIGH);
  long distance = duration * 0.034 / 2;
  
  return distance;
}`,
    estimatedTime: "3 hours",
    author: "Knowledge Garden Team", 
    tags: ["arduino", "bluetooth", "robotics", "motor-control", "obstacle-avoidance"]
  },
  {
    title: "Solar Panel Energy Monitor",
    description: "Monitor solar panel performance with real-time voltage, current, and power measurements. Includes data logging, efficiency calculations, and web dashboard for remote monitoring.",
    category: "energy",
    difficulty: "advanced",
    components: ["ESP32", "INA219 Current Sensor", "Voltage Divider", "SD Card Module", "OLED Display", "Solar Panel"],
    codeSnippet: `#include <WiFi.h>
#include <WebServer.h>
#include <Wire.h>
#include <Adafruit_INA219.h>
#include <SSD1306.h>
#include <SD.h>

Adafruit_INA219 ina219;
SSD1306 display(0x3c, 21, 22);
WebServer server(80);

const char* ssid = "YOUR_WIFI";
const char* password = "YOUR_PASSWORD";

struct EnergyData {
  float voltage;
  float current;
  float power;
  float energy;
  unsigned long timestamp;
};

EnergyData currentData;
float totalEnergy = 0;
unsigned long lastMeasurement = 0;

void setup() {
  Serial.begin(115200);
  
  // Initialize INA219
  if (!ina219.begin()) {
    Serial.println("Failed to find INA219 chip");
    while (1);
  }
  
  // Initialize display
  display.init();
  display.flipScreenVertically();
  display.setFont(ArialMT_Plain_10);
  
  // Initialize SD card
  if (!SD.begin(5)) {
    Serial.println("SD Card initialization failed!");
  }
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  // Setup web server
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.begin();
  
  Serial.println("Solar Monitor Started");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  server.handleClient();
  
  // Read sensor data every second
  if (millis() - lastMeasurement > 1000) {
    readSensorData();
    updateDisplay();
    logToSD();
    lastMeasurement = millis();
  }
  
  delay(100);
}

void readSensorData() {
  currentData.voltage = ina219.getBusVoltage_V();
  currentData.current = ina219.getCurrent_mA();
  currentData.power = currentData.voltage * (currentData.current / 1000.0);
  currentData.timestamp = millis();
  
  // Calculate energy (Wh)
  static unsigned long lastTime = 0;
  if (lastTime > 0) {
    float timeDiff = (millis() - lastTime) / 3600000.0; // Convert to hours
    totalEnergy += currentData.power * timeDiff;
  }
  lastTime = millis();
  
  currentData.energy = totalEnergy;
}

void updateDisplay() {
  display.clear();
  
  display.drawString(0, 0, "Solar Panel Monitor");
  display.drawString(0, 15, "Voltage: " + String(currentData.voltage, 2) + "V");
  display.drawString(0, 25, "Current: " + String(currentData.current, 1) + "mA");
  display.drawString(0, 35, "Power: " + String(currentData.power, 2) + "W");
  display.drawString(0, 45, "Energy: " + String(currentData.energy, 3) + "Wh");
  
  // Calculate efficiency (assuming 100W panel)
  float efficiency = (currentData.power / 100.0) * 100;
  display.drawString(0, 55, "Efficiency: " + String(efficiency, 1) + "%");
  
  display.display();
}

void logToSD() {
  File dataFile = SD.open("/solar_data.csv", FILE_APPEND);
  if (dataFile) {
    dataFile.print(currentData.timestamp);
    dataFile.print(",");
    dataFile.print(currentData.voltage);
    dataFile.print(",");
    dataFile.print(currentData.current);
    dataFile.print(",");
    dataFile.print(currentData.power);
    dataFile.print(",");
    dataFile.println(currentData.energy);
    dataFile.close();
  }
}

void handleRoot() {
  String html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>Solar Monitor Dashboard</title>
    <meta http-equiv='refresh' content='5'>
    <style>
        body { font-family: Arial; margin: 20px; }
        .card { border: 1px solid #ddd; padding: 20px; margin: 10px 0; border-radius: 8px; }
        .value { font-size: 24px; font-weight: bold; color: #2c5282; }
    </style>
</head>
<body>
    <h1>Solar Panel Energy Monitor</h1>
    <div class='card'>
        <h3>Real-time Data</h3>
        <p>Voltage: <span class='value'>)" + String(currentData.voltage, 2) + R"( V</span></p>
        <p>Current: <span class='value'>)" + String(currentData.current, 1) + R"( mA</span></p>
        <p>Power: <span class='value'>)" + String(currentData.power, 2) + R"( W</span></p>
        <p>Total Energy: <span class='value'>)" + String(currentData.energy, 3) + R"( Wh</span></p>
    </div>
</body>
</html>
  )";
  server.send(200, "text/html", html);
}

void handleData() {
  String json = "{";
  json += "\"voltage\":" + String(currentData.voltage, 2) + ",";
  json += "\"current\":" + String(currentData.current, 1) + ",";
  json += "\"power\":" + String(currentData.power, 2) + ",";
  json += "\"energy\":" + String(currentData.energy, 3) + ",";
  json += "\"timestamp\":" + String(currentData.timestamp);
  json += "}";
  server.send(200, "application/json", json);
}`,
    estimatedTime: "5 hours",
    author: "Knowledge Garden Team",
    tags: ["esp32", "solar", "energy-monitoring", "web-dashboard", "data-logging", "renewable-energy"]
  }
];

async function seedTutorials() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Clear existing tutorials
    await Tutorial.deleteMany({});
    console.log('Cleared existing tutorials');
    
    // Insert sample tutorials
    await Tutorial.insertMany(sampleTutorials);
    console.log('Sample tutorials inserted successfully');
    
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding tutorials:', error);
  }
}

if (process.argv[2] === 'seed') {
  seedTutorials();

}