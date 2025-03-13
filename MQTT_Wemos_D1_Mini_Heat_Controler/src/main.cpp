#include <Arduino.h>
#include <ESP8266WiFi.h>
#include <PubSubClient.h>
#include <Adafruit_Sensor.h>
#include <OneWire.h>
#include <WiFiUdp.h>
#include <ArduinoOTA.h>
#include <NTPClient.h>
#include <ESP_Mail_Client.h>
// put your ssid and password here
//const char *ssid = "Gimp";
const char *ssid = "Gimp_EXT";
const char *password = "FC7KUNPX";

// put your mqtt server here:

const char *mqtt_server = "c846e85af71b4f65864f7124799cd3bb.s1.eu.hivemq.cloud";
const int mqtt_port = 8883; // Secure MQTT port
const char *mqtt_user = "Tortoise";
const char *mqtt_password = "Hea1951Ter";

// Initialize the pubsub client
WiFiClientSecure espClient;
PubSubClient client(espClient);

// put global variables here:
// Define pins and other constants
#define Relay_Pin D5 // active board
// #define builtInLED_Pin 13    // on board LED_Pin
#define LED_Pin D6 // LED_Pin  //change when debuged
OneWire ds(D7);    // active board  // on pin 10 (a 4.7K resistor is necessary)

// Define pins and other constants
byte i, present = 0, type_s, data[12], addr[8];

float celsius, s1, s2, s3, stores1, stores2, stores3, prevS1 = -1, prevS2 = -1, prevS3 = -1;

int adr;
uint_fast8_t amTemperature, pmTemperature, amTemp, pmTemp; // is set by the sliders
uint_fast8_t AMtime, PMtime, Day, Hours, Minutes, seconds, amHours, amMinutes, pmHours, pmMinutes, prevHours = -true, prevMinutes = -1;
bool Am, AmFlag, heaterStatus = false, publishStartUp = true, StartUp = true, heaterOn = false, prevHeaterStatus = false;
// Timer-related variables
unsigned long heaterOnTime = 0;
const unsigned long heaterTimeout = 3600000;

char prevTargetTemperature[23], targetTemperature[23];

/********************************************
      settup the time variables start
 * ******************************************/

char daysOfTheWeek[7][12] = {"Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"};
char sensor[50];
// Define NTP Client to get time
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 0, 60000);
// Time zone and DST offsets
const long utcOffsetInSeconds = 0;    // Standard time offset (e.g., UTC+0)
const long dstOffsetInSeconds = 3600; // Daylight saving time offset (e.g., +1 hour)

// Function to check if DST is in effect
bool isDST(int day, int month, int hour, int weekday)
{
  // Example logic for DST in Europe (last Sunday in March to last Sunday in October)
  if (month < 3 || month > 10)
    return false; // No DST in Jan, Feb, Nov, Dec
  if (month > 3 && month < 10)
    return true;                  // DST in Apr, May, Jun, Jul, Aug, Sep
  int lastSunday = day - weekday; // Calculate the last Sunday of the month
  if (month == 3)
    return (lastSunday >= 25 && (hour >= 2)); // DST starts at 2 AM on the last Sunday in March
  if (month == 10)
    return (lastSunday < 25 || (lastSunday == 25 && hour < 2)); // DST ends at 2 AM on the last Sunday in October
  return false;
}
/********************************************
      settup the time variables end
 * ******************************************/
/********************************************
      wifi and pubSup credentials start
 * ******************************************/

// the sender email credentials
#define SENDER_EMAIL "esp8266heaterapp@gmail.com";
#define SENDER_PASSWORD "xhjh djyf roxm sxzh";
#define RECIPIENT_EMAIL "mac5y4@talktalk.net"
#define SMTP_HOST "smtp.gmail.com";
#define SMTP_PORT 587;

SMTPSession smtp;

WiFiClient Temp_Control;
// PubSubClient client(Temp_Control);
unsigned long lastMsg = 0;
#define MSG_BUFFER_SIZE (50)
char msg[MSG_BUFFER_SIZE];
long int value = 0;

// Function prototypes
// void setup_wifi();
void callback(char *topic, uint8_t *payload, unsigned int length);
// void callback(char *topic, byte *payload, unsigned int length);
int reconnect(int index);
void publishTempToMQTT();
void relay_Control();
void sendSensor();
void startHeaterTimer();
void checkHeaterTimeout();
void smtpCallback(SMTP_Status status);
void gmail_send(String subject, String message);

/********************************************
  Static IP address and wifi conection Start
********************************************/

// Set your Static IP address
IPAddress local_IP(192, 168, 1, 184);
// Set your Gateway IP address
IPAddress gateway(192, 168, 1, 1);

IPAddress subnet(255, 255, 0, 0);
IPAddress primaryDNS(8, 8, 8, 8);   // optional
IPAddress secondaryDNS(8, 8, 4, 4); // optional
/********************************************
     Static IP address and wifi conection end
 ********************************************/

/********************************************
      wifi and pubSup credentials end
 * ******************************************/

void setup()
{
  pinMode(Relay_Pin, OUTPUT);
  pinMode(LED_Pin, OUTPUT);     // digitalWrite (LED_Pin, LOW);//LED_Pin off
  pinMode(LED_BUILTIN, OUTPUT); // Initialize the LED_BUILTIN pin as an output
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("WiFi connected");

  timeClient.begin();
  timeClient.setTimeOffset(utcOffsetInSeconds);
  espClient.setInsecure(); // For basic TLS without certificate verification
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  // Attempt to reconnect and check the return value
  if (reconnect(1) == 1)
  {
    Serial.println("AAA setup Successfully connected and subscribed in setup");
  }
  else
  {
    Serial.println("xxxxxxxFailed to connect and subscribe in setup");
  }

  /************************************
            OVER THE AIR START
    *                                  *
    ************************************/

  // ArduinoOTA.setHostname("INSIDE");
  ArduinoOTA.setHostname("TORTOISE_HOSING");
  // ArduinoOTA.setHostname("TEST RIG");
  ArduinoOTA.onStart([]()
                     {
    String type;
    if (ArduinoOTA.getCommand() == U_FLASH)
      type = "sketch";
    else  // U_SPIFFS
      type = "filesystem";

    // NOTE: if updating SPIFFS this would be the place to unmount SPIFFS using SPIFFS.end()
    Serial.println("Start updating " + type); });
  ArduinoOTA.onEnd([]()
                   { Serial.println("\nEnd"); });
  ArduinoOTA.onProgress([](unsigned int progress, unsigned int total) {});
  ArduinoOTA.onError([](ota_error_t error)
                     {
    Serial.printf("Error[%u]: ", error);
    if (error == OTA_AUTH_ERROR) Serial.println("Auth Failed");
    else if (error == OTA_BEGIN_ERROR) Serial.println("Begin Failed");
    else if (error == OTA_CONNECT_ERROR) Serial.println("Connect Failed");
    else if (error == OTA_RECEIVE_ERROR) Serial.println("Receive Failed");
    else if (error == OTA_END_ERROR) Serial.println("End Failed"); });
  ArduinoOTA.begin();
  Serial.println("Ready");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}
/************************************
         OVER THE AIR END
 ************************************/
void loop()
{
  ArduinoOTA.handle();
  if (!client.connected())
  {
    Serial.println("void loop() line 175");
    // Serial.println("Calling Reconnect to MQTT server");
    // Attempt to reconnect and check the return value
    if (reconnect(2) == 1)
    {
      Serial.println("BBB loop Successfully connected and subscribed in setup");
    }
    else
    {
      Serial.println("Failed to connect and subscribe in setup");
    }
  }
  client.loop();
  sendSensor();
  publishTempToMQTT();
  relay_Control();
  timeClient.update();
  // Day = timeClient.getDay();
  // Hours = timeClient.getHours();

  unsigned long epochTime = timeClient.getEpochTime();
  // Convert epoch time to struct tm
  time_t rawTime = epochTime;
  struct tm *timeInfo = localtime(&rawTime);

  // Extract time components
  int currentDay = timeInfo->tm_mday;
  int currentMonth = timeInfo->tm_mon + 1; // tm_mon is 0-based
  int currentHour = timeInfo->tm_hour;
  int currentWeekday = timeInfo->tm_wday; // tm_wday is 0-based (Sunday)

  // Adjust for DST
  if (isDST(currentDay, currentMonth, currentHour, currentWeekday))
  {
    epochTime += dstOffsetInSeconds;
    rawTime = epochTime;
    timeInfo = localtime(&rawTime);
  }
  Hours = (timeInfo->tm_hour);
  Minutes = (timeInfo->tm_min);
  seconds = (timeInfo->tm_sec);
  Am = true;
  Am = (Hours < 12);
  // if StartUp == 1 and Am true then targetTemperature must ==  amTemperature else  targetTemperature must == pmTemperature
  if (StartUp && Am == true)
  {
    sprintf(targetTemperature, "%d", amTemperature);
    Serial.println("StartUp == true and Am == true");
    StartUp = false;
  }
  else if (StartUp && Am == false)
  {
    sprintf(targetTemperature, "%d", pmTemperature);
    Serial.println("StartUp == true and Am == false");
    StartUp = false;
  }
  if (heaterOn)
  {
    checkHeaterTimeout();
  }
}

// put function definitions here:
// void callback(char *topic, byte *payload, unsigned int length){
void callback(char *topic, uint8_t *payload, unsigned int length)
{
 
  if (payload == nullptr)
  {
    Serial.println("Payload is null");
    return;
  }
  // Serial.print("Payload: ");
  for (unsigned int i = 0; i < length; i++)
  {
    // Serial.print((char)payload[i]);
  }
  //Serial.println();
  if (topic == nullptr || payload == nullptr)
  {
    Serial.println("Error: Null topic or payload");
    return;
  }

  for (unsigned int i = 0; i < length; i++)
  {
    // Serial.print((char)payload[i]);
  }
  //Serial.println();

  // Null-terminate the payload to treat it as a string
  payload[length] = '\0';

  if (strstr(topic, "amTemperature"))
  {
    sscanf((char *)payload, "%d", &amTemperature);
    if (StartUp == true)
    {
      amTemp = amTemperature;
      Serial.println("line 392 amTemp: " + String(amTemp));
    }
  }
  if (strstr(topic, "pmTemperature"))
  {
    sscanf((char *)payload, "%d", &pmTemperature);
    if (StartUp == true)
    {
      pmTemp = pmTemperature;
      StartUp = false;
    }
  }
  if (strstr(topic, "AMtime"))
  {
    sscanf((char *)payload, "%d:%d", &amHours, &amMinutes);
  }
  if (strstr(topic, "PMtime"))
  {
    sscanf((char *)payload, "%d:%d", &pmHours, &pmMinutes);
  }
  if (amTemp != 0 && pmTemp != 0)
  {
    StartUp = 0;
  }
}
int reconnect(int index)
{
  // Serial.println("reconnect index: " + String(index));
  while (!client.connected())
  {
    
    //  Set a longer keep-alive interval (e.g., 60 seconds)
    client.setKeepAlive(60);
    if (client.connect("WemosD1Client", mqtt_user, mqtt_password))
    {
      client.subscribe("Temp_Control/sub");
      client.subscribe("control");
      client.subscribe("amTemperature");
      client.subscribe("pmTemperature");
      client.subscribe("AMtime");
      client.subscribe("PMtime");
      client.subscribe("HeaterStatus");
      client.subscribe("outSide");
      client.subscribe("coolSide");
      client.subscribe("heater");
      return 1;
    }
    else
    {
      Serial.print("line 258 failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      delay(5000);
    }
  }
  return 0;
}

/*************************************************************
                            Relay Control
                                 start
*************************************************************/

void relay_Control()
{
  int targetTemp = AmFlag ? amTemp : pmTemp;
  if (s3 < targetTemp)
  {
    digitalWrite(Relay_Pin, HIGH);
    digitalWrite(LED_Pin, HIGH);    // LED_Pin on
    digitalWrite(LED_BUILTIN, LOW); // LED_Pin on
    heaterStatus = true;
    if (!heaterOn)
    {
      startHeaterTimer();
    }
  }
  else if (s3 > targetTemp)
  {
    digitalWrite(Relay_Pin, LOW);
    digitalWrite(LED_Pin, LOW);      // LED_Pin off
    digitalWrite(LED_BUILTIN, HIGH); // LED_Pin off
    heaterStatus = false;
    heaterOn = false;
  }
}
/*************************************************************
                            Relay Control
                                 End
*************************************************************/

/********************************************
         send temperature value
             to server for
          temperature monitor
                to receive
                  start
* ******************************************/
void publishTempToMQTT(void)
{
  if (!client.connected())
  {
 
    // Attempt to reconnect and check the return value
    if (reconnect(3) == 1)
    {
      // Serial.println("CCC publish Successfully connected and subscribed in setup");
    }
    else
    {
      // Serial.println("Failed to connect and subscribe in setup");
    }
  }
  char sensVal[50];
  const float threshold = 0.2; // Define a threshold for significant change
  // Publish s1
  if (fabs(s1 - prevS1) > threshold)
  {
    snprintf(sensVal, sizeof(sensVal), "%.2f", s1);
    client.publish("outSide", sensVal, true);
    prevS1 = s1;
  }

  // publish s2
  if (fabs(s2 - prevS2) > threshold)
  {
    snprintf(sensVal, sizeof(sensVal), "%.2f", s2);
    client.publish("coolSide", sensVal, true);
    prevS2 = s2;
  }
  // publish s3
  if (fabs(s3 - prevS3) > threshold)
  {
    snprintf(sensVal, sizeof(sensVal), "%.2f", s3);
    client.publish("heater", sensVal, true);
    prevS3 = s3;
  }

  // publish Hours
  if (Hours != prevHours)
  {
    snprintf(sensVal, sizeof(sensVal), "%d", Hours);
    client.publish("gaugeHours", sensVal, true);
    prevHours = Hours;
  }

  // publish Minutes
  if (Minutes != prevMinutes)
  {
    snprintf(sensVal, sizeof(sensVal), "%d", Minutes);
    client.publish("gaugeMinutes", sensVal, true);
    prevMinutes = Minutes;
  }

  // publish Heater Status
  if (heaterStatus != prevHeaterStatus)
  {
    const char *heaterStatusStr = heaterStatus ? "true" : "false";
    client.publish("HeaterStatus", heaterStatusStr, true);
    prevHeaterStatus = heaterStatus;
  }

  char targetTemperatureStr[23];
  if (strcmp(targetTemperature, prevTargetTemperature) != 0)
  {
    Serial.println("line 464 Publishing target temperature");
    snprintf(targetTemperatureStr, sizeof(targetTemperatureStr), "%s", targetTemperature);
    client.publish("TargetTemperature", targetTemperatureStr, true);
    strcpy(prevTargetTemperature, targetTemperature); // Copy the new value to prevTargetTemperature
  }
}

/********************************************
         send temperature value
             to server for
          temperature monitor
                to receive
                   end
* ******************************************/

/*************************************************************
                            Sensor reading
                                 Start
*************************************************************/

void sendSensor()
{
  /**************************
       DS18B20 Sensor
         Starts Here
  **************************/
  char sensVal[50]; // Declare sensVal here

  if (!ds.search(addr))
  {
    ds.reset_search();
    delay(250);
    return;
  }
  for (i = 0; i < 8; i++)
  { // we need to drop 8 bytes of data
  }
  adr = (addr[7]);

  if (OneWire::crc8(addr, 7) != addr[7])
  {
    Serial.println("CRC is not valid!");
    return;
  }
  ds.reset();
  ds.select(addr);
  ds.write(0x44, 1); // start conversion, with parasite power on at the end

  delay(1000); // maybe 750ms is enough, maybe not
  // we might do a ds.depower() here, but the reset will take care of it.

  present = ds.reset();
  ds.select(addr);
  ds.write(0xBE); // Read Scratchpad

  for (i = 0; i < 9; i++)
  { // we need 9 bytes to drop off
    data[i] = ds.read();
  }

  // Convert the data to actual temperature
  // because the result is a 16 bit signed integer, it should
  // be stored to an "int16_t" type, which is always 16 bits
  // even when compiled on a 32 bit processor.
  int16_t raw = (data[1] << 8) | data[0];
  if (type_s)
  {
    raw = raw << 3; // 9 bit resolution default
    if (data[7] == 0x10)
    {
      // "count remain" gives full 12 bit resolution
      raw = (raw & 0xFFF0) + 12 - data[6];
    }
  }
  else
  {
    byte cfg = (data[4] & 0x60);
    // at lower res, the low bits are undefined, so let's zero them
    if (cfg == 0x00)
      raw = raw & ~7; // 9 bit resolution, 93.75 ms
    else if (cfg == 0x20)
      raw = raw & ~3; // 10 bit res, 187.5 ms
    else if (cfg == 0x40)
      raw = raw & ~1; // 11 bit res, 375 ms
    //// default is 12 bit resolution, 750 ms conversion time
  }
  /**************************
       DS18B20 Sensor
         Ends Here
  **************************/

  /*************************************************************
                              Heater Control
                                   start
  ************************************************************/

  celsius = (float)raw / 16.0;
  // if (adr == 92)
  // { 
    // tortoise encloseure
     if (adr == 181) {  //tortoise encloseure
    //  if(adr == 89)  {        //outside board out side dial
    // if (adr == 49) {
    // test rig board out side dial
    // change celsius to fahrenheit if you prefer output in Fahrenheit;
    s1 = (celsius); // Black outside
  }

  // if (adr == 96)
  // {
    // if (adr == 59) {
   if (adr == 197) {  //tortoise encloseure
    //  change celsius to fahrenheit if you prefer output in Fahrenheit;
    s2 = (celsius); // GREEN coolSide (adr == 59)
    delay(1000);
  }
  // if (adr == 230)
  // { // inside board inSide dial
    // if (adr == 92) {   //inside board inSide dial
    //  if(adr == 116)  {    // outside board inSide dial
     if (adr == 228) {  //tortoise encloseure
    //  change celsius to fahrenheit if you prefer output in Fahrenheit;
    s3 = (celsius); // Heater RED heater
  }
  if (Am)
  {
    if (amHours == Hours && amMinutes == Minutes)
    { // set amTemp for the Night time setting
    Serial.println("line 591 Am == true");
      AmFlag = true;
      amTemp = amTemperature;
      // int myTemp = amTemp;
      snprintf(targetTemperature, sizeof(targetTemperature), "%d", amTemp);
    }
  }
  else
  {
    if (pmHours == Hours && pmMinutes == Minutes)
    { // set pmTemp for the Night time setting
Serial.println("line 602 Am == false");
      AmFlag = false;
      pmTemp = pmTemperature;
      int myTemp = pmTemp;
      snprintf(targetTemperature, sizeof(targetTemperature), "%d", pmTemp);
    }
  }
}
/*************************************************************
                             Heater Control
                                    End
 *************************************************************/

/*************************************************************
                            Sensor reading
                                 End
*************************************************************/

void startHeaterTimer()
{
  heaterOnTime = millis();
  heaterOn = true;
}

/********************************************
                Check Heater Timeout start
 ******************************************/

void checkHeaterTimeout()
{
  if (heaterOn && (millis() - heaterOnTime > heaterTimeout))
  {
    if (s3 < amTemp || s3 < pmTemp) // Check if the temperature is still below the threshold
    {
      client.publish("HeaterStatus", "Temperature did not rise within the expected time.");

      // Prepare the email subject and message
      String subject = "Heater Alert";
      String message = "Temperature did not rise within the expected time. The heater has been turned off.";

      // Send the email
      gmail_send(subject, message);
    }
    heaterOn = false;
  }
}

/********************************************
                Check Heater Timeout end
 ******************************************/

/********************************************
                Email send start
 ******************************************/

void gmail_send(String subject, String message)
{
  // set the network reconnection option
  MailClient.networkReconnect(true);

  smtp.debug(1);

  smtp.callback(smtpCallback);

  // set the session config
  Session_Config config;
  config.server.host_name = SMTP_HOST;
  config.server.port = SMTP_PORT;
  config.login.email = SENDER_EMAIL;
  config.login.password = "xhjh djyf roxm sxzh";
  config.login.user_domain = F("127.0.0.1");
  config.time.ntp_server = F("pool.ntp.org,time.nist.gov");
  config.time.gmt_offset = 3;
  config.time.day_light_offset = 0;

  // declare the message class
  SMTP_Message emailMessage;

  // set the message headers
  emailMessage.sender.name = "ESP8266 Heater App";
  emailMessage.sender.email = SENDER_EMAIL;
  emailMessage.subject = subject;
  emailMessage.addRecipient(F("To Whom It May Concern"), RECIPIENT_EMAIL);

  emailMessage.text.content = message;
  emailMessage.text.charSet = "utf-8";
  emailMessage.priority = esp_mail_smtp_priority::esp_mail_smtp_priority_low;

  // set the custom message header
  emailMessage.addHeader(F("Message-ID: <abcde.fghij@gmail.com>"));

  // connect to the server
  if (!smtp.connect(&config))
  {
    Serial.printf("Connection error, Status Code: %d, Error Code: %d, Reason: %s\n", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
    return;
  }

  if (!smtp.isLoggedIn())
  {
    Serial.println("Not yet logged in.");
  }
  else
  {
    if (smtp.isAuthenticated())
      Serial.println("Successfully logged in.");
    else
      Serial.println("Connected with no Auth.");
  }

  // start sending Email and close the session
  if (!MailClient.sendMail(&smtp, &emailMessage))
    Serial.printf("Error, Status Code: %d, Error Code: %d, Reason: %s\n", smtp.statusCode(), smtp.errorCode(), smtp.errorReason().c_str());
}

// callback function to get the Email sending status
void smtpCallback(SMTP_Status status)
{
  if (status.success())
  {
    for (size_t i = 0; i < smtp.sendingResult.size(); i++)
    {
      // get the result item
      SMTP_Result result = smtp.sendingResult.getItem(i);
    }
    // free the memory
    smtp.sendingResult.clear();
  }
}
/********************************************
                Email send End
 ******************************************/