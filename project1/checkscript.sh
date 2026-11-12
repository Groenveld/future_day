until code=$(curl -s -o /dev/null -m 8 -w '%{http_code}' https://wikiverity.groenveld.ch/) && [ "$code" = 200 ]; do
  echo "$(date +%H:%M:%S)  not ready yet (status: $code)"
  sleep 10
done
echo "$(date +%H:%M:%S)  ✅ https://wikiverity.groenveld.ch is online!"

