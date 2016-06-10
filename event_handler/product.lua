Timeseries.write({
  query = data.alias .. ",sn=" .. data.device_sn .. " value=" .. data.value[2]
})
local value = kv_read(data.device_sn)
value[data.alias] = data.value[2]
value["timestamp"] = data.timestamp/1000
value["pid"] = data.vendor or data.pid
value["ip"] = data.source_ip
kv_write(data.device_sn, value)
