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

if value.alerts ~= nil then
  local timerid = sn .. "_" .. data.alias
  for _, alert in ipairs(value["alerts"]) do
    if alert.active then -- enabled
      if alert.state == value.state then -- alert condition true
        if not alert.timer_running then -- not running
          Timer.sendAfter({
            message = alert.message,
            duration = alert.timer * 60 * 1000,
            timer_id = timerid
          })
          alert.timer_running = true
        end
      else -- alert condition false
        if alert.timer_running then -- running
          Timer.cancel({timer_id = timerid})
          alert.timer_running = false
        end
      end
    else -- disabled
      if alert.timer_running then -- running
        Timer.cancel({timer_id = timerid})
        alert.timer_running = false
      end
    end
  end
end
kv_write(data.device_sn, value)
