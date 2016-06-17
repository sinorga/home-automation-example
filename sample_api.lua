--#ENDPOINT PUT /user/{email}
local ret = User.createUser({
  email = request.parameters.email,
  name = request.parameters.email,
  password = request.body.password
})
if ret.status_code ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  local domain = string.gsub(request.uri, 'https?://(.-/)(.*)', '%1')
  local text = "Hi " .. request.parameters.email .. ",\n"
  text = text .. "Click this link to verify your account:\n"
  text = text .. "https://" .. domain .. "verify/" .. ret;
  Email.send({
    from = 'Sample App <mail@exosite.com>',
    to = request.parameters.email,
    subject = ("Signup on " .. domain),
    text = text
  })
end
--#ENDPOINT GET /verify/{code}
local ret = User.activateUser({code = request.parameters.code})
if ret ~= nil and ret.status_code ~= nil then
  response.code = ret.status_code
  if response.code == 200 then
    response.message = 'Signed up successfully.'
  else
    response.message = 'Sign up failed. Error: ' .. ret.message
  end
  return response.message
end
--#ENDPOINT PATCH /user/{email}
local user = currentUser(request)
if user ~= nil then
  User.updateUserStorage({id = user.id, ["key values"] = request.body})
  User.createUserStorage({id = user.id, ["key values"] = request.body})
end
--#ENDPOINT POST /session
local ret = User.getUserToken({
  email = request.body.email,
  password = request.body.password
})
if ret ~= nil and ret.status_code ~= nil then
  response.code = ret.status_code
  response.message = ret.message
else
  response.headers = {
    ["Set-Cookie"] = "sid=" .. tostring(ret)
  }
  response.message = {["token"] = ret}
end
--#ENDPOINT GET /session
--
local user = currentUser(request)
if user ~= nil and user.id ~= nil then
    return {["token"] = sid}
end
response.code = 400
response.message = "Session invalid"
--#ENDPOINT POST /user/{email}/lightbulbs
local sn = tostring(request.body.serialnumber);
local link = request.body.link;
local user = currentUser(request)

if user == nil or user.id == nil then
  http_error(403, response)
  return
end

local owners = User.listRoleParamUsers({
  role_id = "owner",
  parameter_name = "sn",
  parameter_value = sn
})

if link == true then
  if #owners == 0 then
    local resp = User.assignUser({
      id = user.id,
      roles = {{
        role_id = "owner",
        parameters = {{
          name = "sn",
          value = sn
        }}
      }}
    })
    response.code = resp.status_code
    response.message = resp.message
    return
  else
    response.message = "Conflict"
    response.code = 409
    return
  end
elseif link == false then
  local is_owner = false
  for i, owner_id in ipairs(owners) do
    if owner_id == user.id then
      is_owner = true
      break
    end
  end
  if is_owner == false then
    response.message = "Conflict"
    response.code = 409
    return
  else
    local guests = User.listRoleParamUsers({
      role_id = "guest",
      parameter_name = "sn",
      parameter_value = sn
    })
    for i, guest in ipairs(guests) do
      User.deassignUserParam({
        id = guest,
        role_id = "guest",
        parameter_name = "sn",
        parameter_value = sn
      })
    end
    User.deassignUserParam({
      id = user.id,
      role_id = "owner",
      parameter_name = "sn",
      parameter_value = sn
    })
  end
else
  response.message = "Conflict"
  response.code = 409
end
--#ENDPOINT GET /user/{email}/lightbulbs
local user = currentUser(request)
if user ~= nil then
  local list = {}
  local roles = User.listUserRoles({id = user.id})
  for _, role in ipairs(roles) do
    for _, parameter in ipairs(role.parameters) do
      if parameter.name == "sn" then
        local device_info = kv_read(parameter.value)
        if role.role_id == "owner" then
          device_info.type = "full"
        else
          device_info.type = "readonly"
        end
        device_info.serialnumber = parameter.value
        table.insert(list, device_info)
      end
    end
  end
  return list
else
  http_error(403, response)
end
--#ENDPOINT GET /user/{email}
local user = currentUser(request)
if user ~= nil and user.email == request.parameters.email then
  return User.listUserData({id = user.id})
else
  http_error(403, response)
end
--#ENDPOINT POST /user/{email}/shared/
local sn = tostring(request.body.serialnumber)
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id,
    role_id = "owner",
    parameter_name = "sn",
    parameter_value = sn
  })
  if 'OK' == isowner then
    local guest = User.listUsers({filter = "email::like::" .. request.parameters.email})
    if #guest == 1 and guest[1].id ~= nil then
      local resp = User.assignUser({
        id = guest[1].id,
        roles = {{
          role_id = "guest",
          parameters = {{
            name = "sn",
            value = sn
          }}
        }}
      });
      return {"ok", resp}
    else
      return {"error", "user not found"}
    end
  end
end
http_error(403, response)
--#ENDPOINT DELETE /user/{email}/shared/{sn}
local sn = request.parameters.sn
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
  })
  if isowner == 'OK' then
    local guestusers = User.listRoleParamUsers({
      role_id = "guest", parameter_name = "sn", parameter_value = sn
    })
    if guestusers ~= nil then
      for _, guestid in ipairs(guestusers) do
        local guest = User.getUser({id=guestid})
        if guest.email == request.parameters.email then
          local result = User.deassignUserParam({
            id = guest.id, role_id = "guest", parameter_name = "sn", parameter_value = sn
          })
          return result
        end
      end
    end
  end
end
http_error(403, response)
--#ENDPOINT GET /user/{email}/shared/
local user = currentUser(request)
if user ~= nil then
  if user.email ~= request.parameters.email then
    http_error(403, response)
  else
    local roles = User.listUserRoles({id=user.id})
    local list = {}
    for _, role in ipairs(roles) do
      if role.role_id == "owner" then
        for _, parameter in ipairs(role.parameters) do
          if parameter.name == "sn" then
            local sn = parameter.value
            local user_info = {serialnumber=sn, email=user.email, type="full"}
            table.insert(list, user_info)
            local guestusers = User.listRoleParamUsers({
              role_id = "guest", parameter_name = "sn", parameter_value = parameter.value
            })
            if guestusers ~= nil then
              for _, guestid in ipairs(guestusers) do
                local guest = User.getUser({id=guestid})
                local guest_info = {serialnumber=sn, email=guest.email, type="readonly"}
                table.insert(list, guest_info)
              end
            end
          end
        end
      end
    end
    return list
  end
end
http_error(403, response)
--#ENDPOINT POST /lightbulb/{sn}
local sn = tostring(request.parameters.sn)
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
  })
  if isowner == 'OK' then
    for _, alias in ipairs({"state", "hours", "temperature"}) do
      if request.body[alias] ~= nil then
        local result = write(sn, alias, request.body[alias])
      end
    end
    response.code = 200
  else
    http_error(403, response)
  end
else
  http_error(403, response)
end

--#ENDPOINT GET /lightbulb/{sn}
local sn = tostring(request.parameters.sn)
local user = currentUser(request)
if user ~= nil then
  local isowner = User.hasUserRoleParam({
    id = user.id, role_id = "owner", parameter_name = "sn", parameter_value = sn
  })
  local isguest = User.hasUserRoleParam({
    id = user.id, role_id = "guest", parameter_name = "sn", parameter_value = sn
  })
  if isowner == 'OK' or isguest == 'OK' then
    return kv_read(sn)
  else
    http_error(403, response)
  end
else
  http_error(403, response)
end
--#ENDPOINT POST /lightbulb/{sn}/alert
--{state:on, timer:5, email:user, active:true, message=""}
if not (
  request.body.state and request.body.timer and
  request.body.active and request.body.email and
  request.body.message
) then
  http_error(400, response)
  return
end
local sn = request.parameters.sn
local timerid = sn .. "_state"
local value = kv_read(sn)
local req_alert = {
  state = request.body.state,
  timer = request.body.timer,
  active = request.body.active,
  email = request.body.email,
  message = request.body.message,
  timer_running = false
}
if value.state ~= nil and value.state == request.body.state then -- condition true
  if value.alerts ~= nil then
    for _ ,alert in ipairs(value.alerts) do
      if request.body.active and not alert.timer_running then --enabled, not running
        trigger(req_alert, timerid)
      end
      if not request.body.active and alert.timer_running then --disabled, running
        cancel_trigger(alert)
      end
    end
  else -- no existing alert
    if request.body.active then
      trigger(req_alert, timerid)
    end
  end
end
value.alerts = {req_alert}
kv_write(sn, value)
--#ENDPOINT GET /debug/{cmd}
response.message = debug(request.parameters.cmd)
--#ENDPOINT WEBSOCKET /debug
response.message = debug(websocket_info.message)
--#ENDPOINT GET /_init
User.createRole({role_id = "owner", parameter = {{name = "sn"}}})
User.createRole({role_id = "guest", parameter = {{name = "sn"}}})
