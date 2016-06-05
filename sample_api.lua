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
  local domain = string.gsub(request.uri, '(https?://.-/)(.*)', '%1')
  local text = "Hi " .. request.parameters.email .. ",\n"
  text = text .. "Click this link to verify your account:\n"
  text = text .. domain .. "verify/" .. ret;
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
  response.message = ret.message
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
--
local sn = request.body.serialnumber;
local link = request.body.link;
local user = currentUser(request)

if user == nil or user.id == nil then
  http_error(403, response)
  return
end

local owners = User.listRoleUsers({role_id = "full", parameter = sn})

if link ~= nil then
  if #owners == 0 then
    local resp = User.assignUser({
      id = user.id,
      roles = {{role_id = "full", parameter = sn}}
    })
    return {"assignUser", resp}
  else
    response.message = "Conflict"
    response.code = 409
    return
  end
else
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
    local guests = User.listRoleUsers({role_id = "readonly", parameter = sn})
    for i, guest in ipairs(guests) do
      User.deassignUserParam({id = guest, role_id = "readonly", parameter = sn})
    end
    User.deassignUserParam({id = user.id, role_id = "full", parameter = sn})
  end
end
--#ENDPOINT GET /user/{email}/lightbulbs
local dataports = {"state", "temperature", "hours"};
local user = currentUser(request)
if user ~= nil then
  local list = {}
  local obj = {}
  local roles = User.listUserRoles({id = user.id})
  for i, role in ipairs(roles) do
    if role.parameters ~= nil and role.parameters.sn ~= nil then
      local obj = {sn = role.parameters.sn, type = role.role_id}
      for j, port in ipairs(dataports) do
        obj[port] = read(role.parameters.sn, port)
      end
      table.append(list, obj)
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
local sn = request.body.serialnumber
local user = currentUser(request)
if user ~= nil then
  local isowner = User.checkUserRole({id = user.id, role_id = "full", parameters = {
    name = "full",
    value = sn
  }})
  if isowner then
    local guest = User.findUserByEmail({email = request.parameters.email})
    if guest ~= nil and guest.id ~= nil then
      User.assignUserParam({id = guest.id, role_id = "readonly", parameters = {{name = "sn", value = sn}}})
    end
  end
end
http_error(403, response)
--#ENDPOINT DELETE /user/{email}/shared/{sn}
local sn = request.body.serialnumber
local user = currentUser(request)
if user ~= nil then
  local isowner = User.checkUserRole({id = user.id, role_id = "full", parameters = {
    name = "full",
    value = sn
  }})
  if isowner then
    local guest = User.findUserByEmail({email = request.parameters.email})
    if guest ~= nil and guest.id ~= nil then
      User.deassignUserParam({id = guest.id, role_id = "readonly", parameters = {{name = "sn", value = sn}}})
    end
  end
end
http_error(403, response)
--#ENDPOINT GET /user/{email}/shared/
--[[return users.getMe(token).then(function(me) {
    if (me.email != parameters.email) {
        return respond('Permission denied', 403);
    } else {
        return users.getAssignedRoles(me.id);
    }
}).filter(function(role) {
    return role.parameter && role.role_id == 'full';
}).map(function(role) {
    return promise.props({
        'serialnumber': role.parameter,
        'email': users.getAssignedUsers('readonly', role.parameter).map(function(id) {
            return users.getUser(id)
        }).map(function(user) {
            return user.email;
        })
    });
}).all().then(function(sns) {
    var results = [];
    for (var i = 0; i < sns.length; i++) {
        var device = sns[i];
        for (var j = 0; j < device.email.length; j++) {
            results.push({
                'serialnumber': device.serialnumber,
                'type': 'readonly',
                'email': device.email[j]
            });
        }
    }
    return results;
});]]
--#ENDPOINT POST /lightbulb/{sn}
response.message = write(request.parameters.sn, request.body.alias, request.body.value);
--#ENDPOINT GET /lightbulb/{sn}
local sn = request.parameters.sn
if sn ~= nil then
  return {
    state = read(sn, "state"),
    hours = read(sn, "hours"),
    temperature = read(sn, "temp")
  }
end
http_error(404, response)
--#ENDPOINT GET /debug/{cmd}
response.message = debug(request.parameters.cmd)
--#ENDPOINT WEBSOCKET /debug
response.message = debug(websocket_info.message)
