function currentUser(request)
  local _, _, sid = string.find(request.headers.cookie, "sid=([^;]+)")
  local user = User.getCurrentUser({Authorization = "Bearer "..sid})
  if user ~= nil and user.id ~= nil then
    return user
  end
  return nil
end

function read(sn, alias)
end

function write(sn, alias, value)
end
