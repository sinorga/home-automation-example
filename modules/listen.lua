function listen(websocket_info)
  local msg = websocket_info.message
  if msg == nil then
    return
  end
  local dat = from_json(msg)
  if dat ~= nil and dat.email ~= nil and dat.password ~= nil and dat.sn ~= nil then
    local sn = tostring(dat.sn)
    local tkn = User.getUserToken({email = dat.email, password = dat.password})
    if tkn ~= nil then
      local user = User.getCurrentUser({token = tkn})
      if user ~= nil then
        local isowner = User.hasUserRoleParam({
          id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
        })
        local isguest = User.hasUserRoleParam({
          id = user.id, role_id = "guest", parameter_name = "sn", parameter_value = sn
        })
        if isowner == 'OK' or isguest == 'OK' then
          local value = kv_read(sn)
          value.listen = {sn = sn, socket_id = websocket_info.socket_id}
          kv_write(sn, value)
          return "ok"
        end
      end
    end
  end
  return "forbidden"
end
