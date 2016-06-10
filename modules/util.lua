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
    return user
  end
  return nil
end

function kv_read(sn)
  local resp = Keystore.get({key = "sn_" .. sn})
  local value = {
    temperature = "undefined",
    hours = "undefined",
    state = "undefined"
  }
  if type(resp) == "table" and type(resp.value) == "string" then
    value = from_json(resp.value)
  end
  return value
end

function kv_write(sn, values)
  Keystore.set({key = "sn_" .. sn, value = to_json(values)})
end

function deviceRpcCall(sn, procedure, args)
  local device = kv_read(sn)
  if device.pid == nil then
    return "device needs to send data first"
  end
  local ret = Device.rpcCall({pid = device.pid, calls = {{
    id = "1",
    procedure = "lookup",
    arguments = {"alias", tostring(sn)}
  }}})
  if type(ret) ~= "table" then
    return "error in lookup rpc call"
  end
  if ret[1].status ~= "ok" then
    return "error in lookup: "..ret[1].result
  end

  local rid = ret[1].result

  local ret2 = Device.rpcCall({pid = device.pid, auth = {client_id = rid}, calls = {{
    id = "1",
    procedure = procedure,
    arguments = args
  }}})
  return ret2[1]
end

function write(sn, alias, value)
  return deviceRpcCall(sn, "write", {
    {alias = alias},
    value
  })
end

http_error_codes = {
  [403] = {
    code = 403,
    message = "Permission Denied",
    headers = {}
  }
}

function http_error(code, response)
  for key, value in pairs(http_error_codes[code]) do
    response[key] = value
  end
end
