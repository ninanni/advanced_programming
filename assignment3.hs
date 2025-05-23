cartesian :: [a] -> [b] -> [(a,b)]
cartesian a b = [(x, y) | x <- a, y <- b]

lpl2ll :: [(a, [a])] -> [[a]]
lpl2ll l = [x : xs | (x,xs) <- l]

genCartesian :: [[a]] -> [[a]]
genCartesian [] = [[]]
genCartesian (xs : xxs) = lpl2ll (cartesian xs (genCartesian xxs))


allAssignments :: [String] -> [[(String,Bool)]]
--allAssignments l = genCartesian [[(v, a) | a <- [True, False]] | v <- l]      Works as well but reuses one less of our functions
allAssignments l = genCartesian [cartesian [v] [True, False] | v <- l]

data Formula = And Formula Formula
    | Or Formula Formula
    | Implies Formula Formula
    | Not Formula
    | Variable String

vars :: Formula -> [String]
vars (And f1 f2)      = vars f1 ++ vars f2
vars (Or f1 f2)       = vars f1 ++ vars f2
vars (Implies f1 f2)  = vars f1 ++ vars f2
vars (Not f)          = vars f
vars (Variable v)     = [v]

contains :: Eq a => a -> [a] -> Bool
contains _ [] = False
contains a (x:xs) = (a == x) || contains a xs

unique :: Eq a => [a] -> [a]
unique [] = []
unique (x:xs) = if not (contains x xs) then x : unique xs else unique xs

valueOf :: String -> [(String,Bool)] -> Bool
valueOf _ [] = error "Value not found"
valueOf v ((s, b):xs) = if v==s then b else valueOf v xs
--valueOf v ((s, b):xs) | v==s = b (could do the matching from this and the following line instead of if else)
--valueOf v ((s, b):xs) = valueOf v xs 

check :: Formula -> [(String,Bool)] -> Bool
check f assignment = case f of
    And f1 f2 -> check f1 assignment && check f2 assignment
    Or f1 f2 -> check f1 assignment || check f2 assignment
    Implies f1 f2 -> not (check f1 assignment) || check f2 assignment
    Not f1 -> not (check f1 assignment)
    Variable v -> valueOf v assignment

solve :: Formula -> Maybe [(String,Bool)]
solve f =
    case filtered of
    [] -> Nothing
    valid:xs -> Just valid
    where
        filtered = filter (check f) (allAssignments (unique (vars f)))


task1 = solve (Or (Variable "a") (Or (Variable "b") (Or (Variable "c") (Or (Variable "d") (Or (Variable "e") (Variable "f"))))))
--running task1 gives Just [("a",True),("b",True),("c",True),("d",True),("e",True),("f",True)], so an assignment that satisfies 
--the formula is a->True, b->True, c->True, d->True, e->True, f->True,

task2 = solve (And (Not (Variable "a")) (And (Variable "a") (And (Variable "b") (And (Variable "c") (And (Variable "d") (And (Variable "e") (Variable "f")))))))
--running task2 gives Nothing, meaning that no possible assignment satisfies the formula

--therefore, the first formula is satsifiable and the second formula isn't