Timeseries.write({
  query = data.alias .. ",sn=" .. data.device_sn .. " value=" .. data.value[2]
})
local value = kv_read(data.device_sn)
value[data.alias] = data.value[2]
value["timestamp"] = data.timestamp
kv_write(data.device_sn, value)
