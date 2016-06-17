--[[
  data
  The data from the device

  data.api enum string (write|record)
  Provider API

  data.rid string
  Unique device resource id

  data.seq integer
  The message sequence number for specific resource id

  data.alias string
  Device resource alias

  data.value table{1 = "live"|timestamp, 2 = value}
  Data transmitted by the device

  data.vendor string
  Device vendor identifier

  data.device_sn string
  Device Serial number

  data.source_ip string
  The device source ip

  data.timestamp integer
  Event time
--]]

Timeseries.write({
  query = data.alias .. ",sn=" .. data.device_sn .. " value=" .. data.value[2]
})
local value = kv_read(data.device_sn)
value[data.alias] = data.value[2]
value["timestamp"] = data.timestamp/1000
value["pid"] = data.vendor or data.pid
value["ip"] = data.source_ip

if value.alerts ~= nil and data.alias == "state" then
  local timerid = data.device_sn .. "_state"
  for _ ,alert in ipairs(value.alerts) do
    if alert.state == value.state then --condition true
      if alert.active and not alert.timer_running then --enabled, not running
        trigger(alert, timerid)
      end
    end
    if not alert.active and alert.timer_running then --disabled, running
      cancel_trigger(alert)
    end
  end
end
kv_write(data.device_sn, value)
