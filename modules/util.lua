function currentUser(request)
  local _, _, sid = string.find(request.headers.cookie, "sid=([^;]+)")
  local user = User.getCurrentUser({token = sid})
  if user ~= nil and user.id ~= nil then
    return user
  end
  return nil
end

function read(sn, alias)
end

function write(sn, alias, value)
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
