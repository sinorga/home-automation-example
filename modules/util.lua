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
