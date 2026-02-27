class User:

    def __init__(self,org_id,name,email,password,role="ADMIN"):
        self.org_id = org_id
        self.name = name
        self.email = email
        self.password = password
        self.role = role
