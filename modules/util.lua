function currentUser(request)
  if type(request.headers.cookie) ~= "string" then
    return nil
  end
  local _, _, sid = string.find(request.headers.cookie, "sid=([^;]+)")
  if type(sid) ~= "string" then
    return nil
  end
  local user = User.getCurrentUser({token = sid})
  if user ~= nil and user.id ~= nil then
    user.token = sid
    return user
  end
  return nil
end

function table.contains(table, element)
  for _, value in pairs(table) do
    if value == element then
      return true
    end
  end
  return false
end

function default(t, key, defaultValue) 
  function table.contains(table, element)
    for key, _ in pairs(table) do
      if key == element then
        return true
      end
    end
    return false
  end
  if not table.contains(t, key) then
    t[key] = defaultValue
  end
end

-- read the latest values for a lightbulb device
function kv_read(sn)
  local resp = Keystore.get({key = "sn_" .. sn})
  local device = nil
  if type(resp) == "table" and type(resp.value) == "string" then
    -- device has written. Get the latest written values
    -- and look up everything else.
    device = from_json(resp.value)

    if device ~= nil then 
      if not table.contains(device, 'rid') then
        device.rid = lookup_rid(device.pid, sn) 
      end
    
      if device.temperature == nil or device.humidity == nil or device.state == nil or
         device.temperature == 'undefined' or device.humidity == 'undefined' or device.state == 'undefined' then
        temperature, humidity, state = device_read(device.pid, device.rid)
        device.temperature = temperature
        device.humidity = humidity
        device.state = state
        --default(device, 'temperature', temperature)
        --default(device, 'humidity', humidity)
        --default(device, 'state', state)
      end
    end
  end

  if device == nil then
    -- device has not written yet
    device = {temperature=nil, humidity=nil, state=nil}
  end
  return device
end

function kv_exists(sn)
  local resp = Keystore.get({key = "sn_" .. sn})
  if type(resp) == "table" and type(resp.value) == "string" then
    return true
  else
    return false
  end 
end

function kv_write(sn, values)
  Keystore.set({key = "sn_" .. sn, value = to_json(values)})
end

-- return the device's temperature, humidity, state
function device_read(pid, rid)
  calls = {}
  for k, alias in pairs({'temperature', 'humidity', 'state'}) do
    table.insert(calls, {id=alias, procedure="read", arguments={{alias=alias}, {limit=1}}})
  end
  local rpcret = Device.rpcCall({
    pid = pid, 
    auth = {client_id = rid}, 
    calls = calls})

  -- find and extract the read value from RPC response rpcret
  function get_read_result(alias)
    for k, r in pairs(rpcret) do
      if r.id == alias then
        if table.getn(r.result) > 0 then
          -- get the value part of the data point
          return r.result[1][2]
        else
          return nil
        end
      end
    end
  end
  temperature = get_read_result('temperature')
  humidity = get_read_result('humidity')
  state = get_read_result('state')
  return temperature, humidity, state
end

-- return rid for device, or nil if there is an error
function lookup_rid(pid, sn)
  if pid == nil then
    -- device needs to send data first
    return nil
  end
  local ret = Device.rpcCall({pid = pid, calls = {{
    id = "1",
    procedure = "lookup",
    arguments = {"alias", tostring(sn)}
  }}})
  if type(ret) ~= "table" then
    return "error in lookup rpc call"
  end
  if ret[1].status ~= "ok" then
    -- "error in lookup: "..ret[1].result
    return nil
  end
  return ret[1].result
end

function deviceRpcCall(sn, procedure, args)
  local device = kv_read(sn)
  if device.pid == nil then
    return "device needs to send data first"
  end
  local ret = Device.rpcCall({pid = device.pid, auth = {client_id = device.rid}, calls = {{
    id = "1",
    procedure = procedure,
    arguments = args
  }}})
  return ret[1]
end

function write(sn, alias, value)
  return deviceRpcCall(sn, "write", {
    {alias = alias},
    value
  })
end

http_error_codes = {
  [400] = {
    code = 400,
    message = "Bad Request",
    headers = {}
  },
  [403] = {
    code = 403,
    message = "Permission Denied",
    headers = {}
  },
  [404] = {
    code = 404,
    message = "Not Found",
    headers = {}
  }
}

function http_error(code, response)
  for key, value in pairs(http_error_codes[code]) do
    response[key] = value
  end
end

function trigger(alert, timerid)
  Timer.sendAfter({
    message = alert.message,
    duration = alert.timer * 60 * 1000,
    timer_id = timerid
  })
  alert.timer_running = true
  alert.timer_id = timerid
end

function cancel_trigger(alert)
  Timer.cancel({timer_id = alert.timer_id})
  alert.timer_running = false
end
