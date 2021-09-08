import sqlite3
import os


class Datum:
    def __init__(self, db_name, crud, sql):
        self.sql = sql
        self.crud = crud
        self.query_val = tuple()
        self.db_name = db_name
        # print(self.__dict__)

    def set(self, **kargs):
        if self.crud == "UPDATE":
            arg_lst = [f"{x} = ?" for x in kargs]
            self.sql += f' SET {", ".join(arg_lst)}' if len(arg_lst) else self.sql
            self.query_val += tuple(kargs.values())
            return self
        else:
            raise Exception(f"Can not use 'SET' on a '{self.crud}' command")

    def where(self, **kargs):
        param_lst = [f"{x} = ?" for x in kargs]
        if len(param_lst):
            self.sql += f" WHERE {' AND '.join(param_lst)}"
        self.query_val += tuple(kargs.values())
        return self

    def values(self, **kargs):
        arg_lst = ",".join(kargs.keys())
        arg_values = [kargs[k] for k in kargs.keys()]
        placeholder = ",".join(["?" for k in kargs.keys()])
        self.sql += f"({arg_lst}) VALUES({placeholder})"
        self.query_val += tuple(arg_values)
        return self

    def execute(self):
        connector = sqlite3.connect(self.db_name)
        cursor = connector.cursor()
        # print(self.sql)
        # print(self.query_val)
        cursor.execute(self.sql, self.query_val)
        # map_dict = {"SELECT": cursor.fetchone(),
        #             "EXISTS": (cursor.fetchone() is not None),
        #
        #             # "SELECT_ALL": cursor.fetchall()
        #             }
        # if self.crud in map_dict.keys():
        #     result = map_dict[self.crud]
        if self.crud == "EXISTS":
            result = (cursor.fetchone() is not None)
        elif self.crud == "SELECT":
            result = cursor.fetchone()
        elif self.crud == "SELECT_ALL":
            result = cursor.fetchall()
        elif self.crud in ["UPDATE", "INSERT", "DELETE"]:
            connector.commit()
            result = cursor.lastrowid
        else:
            raise Exception(f"Unknown Datum crud '{self.crud}'")

        connector.close()
        return result

    # todo
    def __bool__(self):
        return self.execute() if self.crud == "EXISTS" else True


class DB:
    def __init__(self):
        abs_file_dir = os.path.dirname(os.path.realpath(__file__))
        abs_db_path = os.path.join(abs_file_dir, '..', 'db', 'myrecipes.sqlite3')
        self.db_name = abs_db_path
        self.exists_queries = {
            "USER": "SELECT USERNAME FROM USERS",
            "RECIPES": "SELECT ID FROM RECIPES",
            "COMMENT": "SELECT ID FROM COMMENTS",
        }
        self.update_queries = {
            "USER": "UPDATE USERS",
            "RECIPES": "UPDATE RECIPES",
            "COMMENT": "UPDATE COMMENTS"
        }
        self.select_queries = {
            "USER": "SELECT ID,USERNAME,EMAIL,FOLLOWING,FOLLOWED_NUM, RECIPES FROM USERS",
            "RECIPES": "SELECT * FROM RECIPES",
            "COMMENT": "SELECT * FROM COMMENTS",
        }
        self.insert_queries = {
            "USER": "INSERT INTO USERS",
            "RECIPES": "INSERT INTO RECIPES",
            "COMMENT": "INSERT INTO COMMENTS"
        }
        self.delete_queries = {
            "USER": "DELETE FROM USERS",
            "RECIPES": "DELETE FROM RECIPES",
            "COMMENT": "DELETE FROM COMMENTS"
        }

        for method in ['exists', 'delete', 'insert', 'select', 'update']:
            self.__dict__[method] = lambda table_name, _method=method: Datum(self.db_name, _method.upper(),
                                                                             self.__dict__[f'{_method}_queries'][
                                                                                 table_name])

    def raw(self, sql):
        connector = sqlite3.connect(self.db_name)
        cursor = connector.cursor()
        cursor.execute(sql)
        result = cursor.fetchall()
        connector.commit()
        connector.close()
        return result

    def select_all(self, query_name):
        s = Datum(self.db_name, "SELECT_ALL", self.select_queries[query_name])
        return s
