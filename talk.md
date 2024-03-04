- Иерархия системы типов

  > Я подготовил доклад по системе типов в Тайпскрипте. Это не доклад про внутренную работу компилятора, оптимизации или малоизвестные фичи. Это доклад про общие концепции и абстракции, которые, я надеюсь, помогут Вам лучше понимать поведение типов. Я не буду рассказывать про то, как работает тайпскрипт - я постараюсь помочь понять, как работать с тайпскриптом.
  >
  > Для начала рассмотрим концепцию иерархии типов - я изобразил ее с помощью такого графа. Под иерархией подразумевается то, что типы стоящие выше по иерархии содержат в себе типы, которые находятся ниже них по иерархии. Если тип `A` находится выше по иерархии типа `B`, то говорят, что тип `B` входит в тип `A`, или что `B` является подтипом `A`, или также в Тайпскрипте используется термин `extends`, в данном случае `B extends A`. В верху иерархии находятся два типа - `any` и `unknown`.
  >
  > **SHOW CODE SNIPPET - `Hierarchy > Graph`**
  >
  > Они эквивалетны друг другу в том плане, что они оба содержат все остальные типы, потому они называются верхним типом, но также они содержат друг друга. В обычных условиях, это бы означало, что эти два типа равны, но это не совсем так. Об этом чуть далее.
  >
  > `unknown` содержит в себе 3 типа `{}`, `null`, и `void`. Тип `void` включает в себя тип `undefined`. Эти последние три типа обозначают все те значения в джаваскрипте, у которых нет свойств. В общем, все те типы, из-за которых вам приходится писать `?.`.
  > `{}` же наоборот все значения, у которых можно обращаться к свойствам и методам. Как бы парадоксально это ни смотрелось, сюда в том числе входят все примитивы - строки, числа и так далее. Не будем уходить в дебри коробочных значений для примитивов - это доклад про тайпскрипт.
  > Далее этот тип делится на `object`, куда уже как раз входят все не примитивные значения, и остальные типы для примитивов.
  >
  > В типы для примитивов также входят типы для их литералов - то есть конкретных значений. В `string` также входит `template literal` - это похоже на литералы для строк, но позволяет писать темплейт-строки аналогично джаваскрипту. Например, `` `this is a ${string}` ``.
  > В тип `object` входят все не примитивные значения - то есть POJO(то, что как правило мы подразумеваем под объектами), а также `Array`, `Date`, `Set`, `Map` и функции, что тоже важно держать в уме. И аналогично примитивам, у некоторых этих типов есть что-то вроде аналога литералов - для POJO можно указать, какие конкретно свойства и каких типов нам нужны. У массивов существует подтип `tuple` - это массив фиксированной длины, самый простой пример это `useState` в Реакте, он возвращает тупль `[state, setState]`. У функций в качестве подтипов существуют классы, и `function type expression`, с помощью которых можно изобразить конкретно форму функции, которая нас интересует: что принимает на ввод, что возвращает. То, что я перечислил аналоги литералов - это именно что аналоги. Литералы у примитивов как правило, если не всегда, соотносятся с каким-то одним конкретным значением - вот у объектов не так, поэтому я и сказал, что это аналогично литералам. У объектов подобные типы описывают все равно множество величин, причем вполне вероятно бесконечное - просто с ограничением на то, какие величины подходят под этот тип.
  >
  > А дальше по иерархии нам снова попадается `any` - вот в этом причудливость этого типа, что он одновременно по сути и верхний, и ПОЧТИ нижний тип, что формально не должно быть возможно. Но этот тип был введен именно как такой костыль/затычка для крайних случаев, где корректную типизацию внедрить не удавалось.
  > А вот еще ниже по ирерархии идет настоящий нижний тип - это `never`. То, что это нижний тип означает то, что таких значений существовать не должно - если у вас где-то в коде появилось значение с типом `never` - как правило, но не всегда, означает, что с точки зрения типизации это невозможный сценарий.
  > Это неплохая модель, чтобы для начала понять, что такое верхний тип, что такое нижний тип и что происходит между ними. Но на таком графе сложно понять, где на ним находятся объединения или пересечения типов - где на этом графе `({ a: string } & { b?: number }) | null`? Также на нем плохо видно, как соотносятся между собой всякие непримитивные типы - где относительно друг друга на иерархии находятся `{ a: string }` и `{a?: string | number }`?
  >
  > **GO TO VENN DIAGRAM**

- Типы как множества

  > Лучше понять как ответить на эти вопросы на поможет диграма Венна - с помощью нее можно изобразить различные множества и как они соотнятся друг с другом. Типы это тоже множества - то есть эдакая коллекция элементов: в данном контексте элементы это всевозможные значения, которые мог бы репрезентовать этот тип.
  >
  > **SHOW CODE SNIPPET - `Hierarchy > Venn`**
  >
  > Величина `"abcde"` представлена типом `string`, но также она может быть представлена типом `"abcde"` или типом `unknown`.
  > На диаграме видно, что у нас есть тип массив, который является подвидом неизменяемого массива, который является подвидом объекта, который является подвидом `unknown`. Это аналогично иерархии, что мы видели ранее на графе.

- Unions

  > Но также тут лучше видны отношения между типами - тип `string | object` находится рядом с множеством объектов, но также включает в себя дополнительное пространство - множество строк. `|` это Union, то есть объединение типов - такое логическое ИЛИ. При операции объединения итоговый тип получается такой же или выше по иерархии, чем был до этого - то есть количество потенциальных значений, которые попадают под этот тип увеличивается и он уже менее точно описывает поведение значения, которое он репрезентует. Если не совсем понятно, почему так - вспоминаем, что самый верхний тип это `unknown`, то есть про значение этого типа мы не знаем вообще ничего.

- Intersections

  > Если нас интересует пересечение типов `string | object` и `string | number`, то мы также видим его на диаграме - это будет просто множество всех строк. `&` это Intersection, то есть перечение типов - логическое И. Эта операция наоборот нам дает либо такой же тип, либо ниже по иерархии. Чем ниже тип - тем точнее он описывает значение, тем для нас лучше. В целом задача типизации подобрать наиболее низкий тип - если мы будет в качестве типа указывать тип выше, чем нам нужно, у нас будет меньше информации, с которой мы можем работать, но при этом мы не должны указывать тип ниже, чем нам нужно - чтобы не отсеивать значения, которые нам тоже могли бы подойти. Примерно по такому принципу и работает сам инференс в тайпскрипте - когда вы не указываете тип величины прямо, он старается подобрать наиболее низкий тип, который бы не противоречил указанной величине.
  >
  > **SHOW CODE SNIPPET - `Hierarchy > Intersection`**
  >
  > Касаемо того как это изображено на диаграме - это лишь иллюстрация, так что размеры, расположение кругов особого значения не имеют - нас по большому счету волнует только каким образом эти множества пересекаются: целиком, частично или вообще не пересекаются. Поэтому, например, множество `string | number` у нас представлено двумя раздельными областями - так в принципе возможно.
  > Из диаграмы также легко видно, где наш верхний тип `unknown` это область, внутри которой находятся абсолютно все другие множества. За пределами этой области ничего нет.
  >
  > **GO TO SECOND VENN DIAGRAM**
  >
  > Тут же находится наш нижний тип `never` - он находится на пересечении всех типов. Это по сути пустое множество, ни одна джаваскриптовая величина не может быть представлена этим типов. Нарисовать конечно все наши области так, чтоб они еще и все пересекались в одной точки - проблематично, но опять же напоминаю, что это все очень условное изображение.
  >
  > **GO TO THIRD VENN DIGRAM**
  >
  > Можно попробовать изобразить это вот так - где красная область это `never`. То, что это пустое множество не мешает нам нарисовать его не как точку, а как область. В любом случае, на практике об этом приходится думать в контексте 2-3 типов, для которых представить такую диаграму в голове - не проблема, зато понять соотношение типов с такой моделью довольно просто.
  > Может возникнуть резонный вопрос - а где же на этой диаграме `any`? Это как раз возвращаясь к тому, о чем я говорил ранее, что это то ли верхний, то ли нижний тип - так как тип построен на противоречии, он в эту модель особо не встраивается. Это больше к слову о том, о чем я говорил ранее, что это такой костыль - он не бесполезный, но лучше его приберечь для всяких ограничений на дженериках.

- Assignability

  > Вот мы поговорили о том, как иерархии типов между собой - но что, собственно, это вообще значит? Ну вот какой-то тип выше другого по иерархии, то есть в этот тип входит больше элементов, чем в другой - а как это понять глядя на два типа?
  >
  > Начнем с того, что типизация в Тайпскрипте - структурная. Что это значит? Чаще в статически типизированных языках встречается номинальная типизация - то есть отношения типов в первую очередь регулируются их идентификаторами, ну и также наследование там играет свою роль.
  >
  > **SHOW CODE SNIPPET - `Assignability > Nominal`**
  >
  > В номинальных языках эти бы два типа не были равнозначны - у них разный идентификатор. Но у нас эти два типы равны - почему? Потому что у них одинаковая структура - и то, и то это просто строка.
  > Как быть с более сложными типами? Вот тут вернемся снова к идее о том, что типы это множества.
  >
  > Что такое множество? Это просто какой-то набор элементов - с конечными множествами все понятно вполне: элементы можно просто перечислить. Но вот большинство множеств - они, скорее, определяеются набором свойств или требований, которые наблюдаются у элементов этого множества. Например, множество всех четных чисел - мы же его определяем не как 2, 4, 6 и так далее, а как все числа, которые нацело делятся на 2.
  >
  > Вот с типами так же - какие-то типы отображают конечное количество элементов, например `"a"|"b"`, но большинство типов имеют бесконечное количество элементов и определяются уже напрямую свойствами. То есть чтобы понять является ли что-то датой с точки зрения тайпскрипта - мы смотрим на то, какие вообще свойства есть у `Date`, смотрим выполняется ли это все для нашей величины, и если да, то для тайпскрипта наша величина это `Date`.
  >
  > Для всего это есть удобное понятие - минимальный контракт. Типы в тайпскрипте описывают минимальный контракт. Представьте, что вы хотите нанять жонглера и в качестве требования к работе у вас - умение жонглировать. Если к вам придет кандидат, который этого не умеет - вы его отклоните. Если к вам придет кандидат, который умеет жонглировать, а также умеет играть на гитаре - ну, вам лишь важно, чтоб жонглировать умел. То есть вам важно, чтоб выполнялся список ваших минимальных требований, а наличие чего-либо сверху - вас не волнует. При этом если вспоминать про объединение типов и почему это дает нам меньше информации о значении, чем конкретный тип - представьте, если бы кандидат сказал, что, возможно, он умеет либо жонглировать, либо играть на гитаре, но что-то одно. Появляется риск того, что окажется, что кандидат умеет лишь играть на гитаре, хоть и шанс того, что он все же умеет жонглировать никуда не пропал - но это лишь шанс, а не гарантия.
  >
  > **SHOW CODE SNIPPET - `Assignability > MinimalContract`**
  >
  > Вот у нас есть функция, которая на выход принимает `MutationObserver` - данный тип выставляет нам довольно небольшой набор требований: у нас должно быть 3 метода, и метод `takeRecord` должен возвращать массив. Можно также заметить, что метод `observe` должен принимать на вход какие-то аргументы. Выполняет ли наш объект данный контракт? Ну вот казалось бы на первый взгляд почти что да, но на самом деле, да, мы целиком выполняем данный контракт.
  >
  > Во-первых, то, что у нашего объекта есть какой-то лишний метод - функцию соверешенно не волнует, ну есть и есть, она им не пользуется. То есть опять же идея МИНИМАЛЬНОГО контракта - если наш объект умеет что-то еще, ну здорово, но хуже от этого не станет. Во-вторых, что с методом `observe` - разве он не должен уметь принимать на вход аргументы? Наш же метод так не умеет - ну, на самом деле, наш метод является подтипом того метода, который есть на `MutationObserver`. Проще всего это объяснить так - что случится, если в функцию, которая не принимает никаких аргументов, все же их передать? Ну, ничего и не случится - функция эти аргументы никак не обработает, и все. Поэтому с тем, как определен наш метод никаких проблем совершенно нет. Получается, что наш объект выполняет минимальный контракт, обозначенный типом `MutationObserver` - следовательно, функция такое значение принимает.
  >
  > Если мы сравним методы `obverse` между нашим объектом и `MutationObserver`, то увидим, что наш метод считается ниже по иерархии. Может быть не совсем понятно почему так - почему то, что наш метод не принимает никаких аргументов на вход, ставит его ниже.
  >
  > **SHOW CODE SNIPPET - `Assignability > WhatIsToBeNarrower`**
  >
  > Что вообще на простых словах означает для типа быть ниже по иерархии, чем какой-то другой? Вот глядя на эти два объекта - может интуитивно показаться, что первый тип находится ниже по иерархии, ведь он выглядит "меньше". На самом деле, ровно наоборот - чем больше вещей умеет делать тип, тем он в целом ниже по иерархии. Если один тип находится ниже другого - это значит, что он умеет все то же самое, что другой тип, но также что-то еще дополнительно. Вот первый тип все что умеет - это свойство `a`, а вот у второго типа есть еще и свойство `b`. То есть у нас больше возможностей с этим типом.
  >
  > Для объектов в целом действует такое правило на глаз, что чем больше свойств - тип объект ниже. Про типы на самих этих свойствах тоже забывать не стоит - например, в следующем примере нельзя уже сказать, что какой-то тип является подтипом другого.
  >
  > **GO TO FOURTH VENN DIAGRAM**
  >
  > У этих типов может быть какое-то пересечение, может и не быть - но ни один тип не содержит целиком другой.
  >
  > Опциональные свойства находятся выше - поскольку мы ослабляем требование для значений. Тип слева требует наличие свойства, тип справа позволяет и значение, у которых есть это свойство этого типа, и те, у которых его нет.
  >
  > Неизменяемые свойства - тут посложнее. Тайпскрипт делает допущение и не считает, что подобный модификатор как-то влияет на тип - тем не менее формально неизменяемые свойства находятся выше по иерархии, так как возможность изменять свойство - это дополнительное требование.
  >
  > Возвращаясь к нашему примеру с методом - если сравнить две аналогичных функции, но одна из которых принимает на ввод строку, то функция без аргумента будет подтипом второй. Потому что наша вторая функция умеет принимать на ввод только строку, а вот первая функция по сути на ввод принимает абсолютно любое значение.
  >
  > Это чуть лучше видно на втором примере - первую функцию можно вызывать без аргумента, а можно вызвать с любым значением. Ну, все то же самое верно и для второй функции ведь? Понятно, что первая функция подразумевает, что мы что-то с этим аргументом делаем, скорее всего - но именно с точки зрения того, как эту функции можно вызывать - они идентичны.
  >
  > **SHOW CODE SNIPPET - `Assignability > Never`**
  >
  > К слову о том, что чем больше свойств - тем ниже тип. А что насчет `never`? Это же самный нижний тип - ну и раз это такое пустое множество, то и свойств у него, наверное, никаких нет? Но это вроде бы противоречит тому, что мы опредилили до этого? Ну вот, на самом деле, свойств у `never` и правда очень много, точнее их бесконечно много, точнее `never` умеет абсолютно все. Если вспомнить, что `never` как правило получается при пересечении всяких несовместимых типов, то становится чуть яснее почему так. Ну то есть если мы объединяем строку и число, то мы получаем `never` - именно потому, что `never` и является одновременно и строкой, и числой, и вообще всем угодно. Да, такого значения в рантайме у нас быть не может, это действительно пустое множество, но именно как тип он описывает величину, которая умеет абсолютно все на свете. `never` это пустое множество, но сам тип вообще не пустой.
  > Поэтому можно столкнуться с такой неочевидной вещью, как `keyof never` - это любой возможный ключ. И собственно, поэтому обращаться мы можем к любым его свойствам без каких-либо ошибок.

- Generics

  > **SHOW CODE SNIPPET - `Generics > Types`**
  >
  > Для того, чтобы подвести к следующей важной теме, я постараюсь вкратце объяснить, что такое дженерик тимы. В джаваскрипте мы как правило условно разделяем значения и функции: значения это какие-то величины, с которыми мы работаем, а функции принимают значения на ввод и выдают новые значения. Если мы представим, что обычные типы это значения, то дженерик-типы - это что-то вроде функций. Например, `Array<T>` это пример дженерика и вот как его можно определить самому. `T` это параметр, который мы передаем в дженерик.

- Variance

  > **SHOW CODE SNIPPET - `Variance > Covariance`**
  >
  > И вот теперь мы подходим к теме, которая звучит страшнее, чем она есть на самом деле, а знать которую очень и очень полезно - речь пойдет про `variance`, "вариативность" по-русским. Не очень понятно, что это вообще значит, да?
  >
  > Вариативность это свойство, которое говорит нам, в какую сторону по нашей иерархии будет двигаться тип при трансформациях. А простым языком - если мы возьмем два типа `A` и его подтип `B`, то если мы прогоним оба этих типа через какой-то дженерик `G`, то `G<B>` будет подтипом `G<A>` или нет?
  >
  > Первым вариантом является ковариативность - она означает, что чем более высокий тип будет передан в дженерик, тем более высокий тип мы получим нм выходе. Вот у нас есть два типа `Narrow` и `Wide`, где первый является подтипом второго. Определим дженерик `WithA`, который будет просто создавать объект со свойством `a` и переданным типом. Теперь применим этот дженерик к каждому из наших типов и посмотрим как эти два типа соотносятся друг с другом - видно, что типы сохранили иерархию относительно друг друга.
  >
  > Массивы тоже ковариативны в Тайскрипте...хотя вообще это неправда. Это можно увидеть на таком вот примере - внезапно в нашем массиве из чисел появился `null`, что нехорошо. Это допущение со стороны Тайпскрипта, но держать в уме его стоит. В целом, на самом деле, это распространяется на все значения, которые можно редактировать - вот аналогичный пример с объектом.
  >
  > **SHOW CODE SNIPPET - `Variance > Contravariance > Keyof`**
  >
  > Что же такого не учитывает Тайпскрипт, что выходит такая ошибка? Дело в том, что Тайпскрипт, пусть и намеренно, игнорирует в данном случае второй вид вариативности - контрвариативность. Давайте вспомним, о чем говорили ранее - чем больше свойств объекта, тем ниже тип, и наоборот. А чем больше свойств объекта, тем у него больше чего? Тем у него больше ключей. Чем больше ключей, тем выше должен быть тип, описывающий множество всех ключей. То есть выходит что чем ниже тип, тем выше тип множества его ключей, так?
  >
  > Давайте определим три типа - `Normal`, у которого есть одно свойство. После определим его подтип `Narrow`, у которого добавилось еще одно свойство. А после определим наоборот его надтип `Wide` - может показаться, что этот тип идентичен предыдущему `Narrow`, но это не так. Прошлый `Narrow` тип гарантирует наличие обоих свойств, новый `Wide` - гарантирует лишь наличие какого-то одно из двух. Теперь определим дженерик тип `Keyof`, который будет возвращать нам ключи, определенные на типе. И посмотрим, что он нам будет возвращать для каждого из наших типов - для наиболее нижнего `Narrow` ожидаемо возвращает оба ключа, определенных на типе, для следующего `Normal` один ключ, а вот для самого верхнего типа `Wide` почему-то `never`.
  >
  > Почему так? Ну, тут можно посмотреть с двух сторон. Когда мы запрашиваем ключи у типа - мы получаем список ключей, которые ГАРАНТИРОВАННО существуют на объекте. И в данном случае гарантировать мы не можем вообще ничего. Можно еще попробовать объяснить так - вспоминаем установку, что чем больше свойств, тем ниже тип, а чем их меньше, тем выше тип. Если наш тип `Wide` является надтипом `Normal`, то свойств у него должно быть меньше, то есть и ключей. Раз у `Normal` из ключей лишь один `"a"`, то ниже уже только `never`.
  >
  > Так вот и что же такое контрвариативность? Посмотрим на отношения между нашими типами после `Keyof` трансформации - если `Narrow` был подтипом `Normal`, то `Keyof<Narrow>` является надтипом `Keyof<Normal>`. С остальными типами аналогично. То есть иерархия наоборот перевернулась - чем более высокий тип мы передаем в дженерик, тем более низкий тип мы получаем на выходе. Это и есть контрвариативность.
  >
  > Два самых ярких ее примера - это как раз ключи на объекте: чем ниже тип объекта, тем выше тип его ключей. Другой такой пример - это параметры на функции. Именно параметры, возвращаемый тип функции уже как раз ковариативен.
  >
  > **SHOW CODE SNIPPET - `Variance > Contravariance > Function`**
  >
  > Может быть не очень интуитивно почему оно вообще так. Давайте посмотрим на это с такой стороны: чем больше разного рода параметров ваша функция принимает на ввод, тем сложнее ее написать. Функций, которые принимают на вход только строки меньше, чем функций, которые принимают на вход и строки, и числа. Если посмотреть наш пример, то функция `Func<Narrow>` умеет принимать на вход только строки, а вот функция `Func<Wide>` умеет все то же самое, так вдобавок еще умеет принимать и числа - ну то есть чем больше вещей умеет тип, тем он ниже.
  >
  > Если посмотреть на конкретном примере, то вот две идентичные функции, но вторая умеет обрабатывать еще и числа. При этом если вторую функцию вызывать только со строками - ее поведение будет абсолютно идентично поведению первой функции.
  >
  > У контрвариативности также специфическое

  - contravariance
    - unions -> &, & -> unions
  - invariance
  - bivariance(not that important, but mention method declarations)

- More on generics
  <!-- TODO - DO I REALLY NEED THIS (START) -->
  > Дженерики можно даже композировать - например, создать дженерик, который будет пользоваться нашим дженериком для создания массива.
  >
  > В отличие от джаваскрипта, где функции можно передавать как значения в другие функции - с дженерик типами так нельзя. Когда так можно, это называется `higher-kinded types` - в некоторых языках программирования так можно, но не в тайпскрипте.
  >
  > **SHOW CODE SNIPPET - `MoreOnGenerics > Bounds`**
  >
  > Как и с функциями, можно указать какого типа аргументы принимаются на вход - например, дженерик для добавления префикса к строке. Таким образом можно указать верхнюю границу типов, которые можно передать. Ну то есть в нашем случае дженерик принимает на вход строку или ее подтипы. Прямого механизма для указания нижней границы нет - то есть указать, что подтипы данного типа передавать наоборот нельзя. Вот наш дженерик, который добавляет префикс к строке с помощью теймплейт литералов, и другой дженерик, который передает второй аргумент сам.
  >
  > **SHOW CODE SNIPPET - `MoreOnGenerics > Conditional`**
  >
  > Но если все же очень хочется - для этого есть `conditional types`. С помощью знакомого `extends` можно прямо внутри типа проверить является ли тип слева подтипом типа справа - например, можно сделать такой дженерик, который проверяет начинается ли строка на заглавную N. С помощью этого в принципе можно задать нижнюю границу принимаемых типов - например, вот дженерик, который проверяет, что `string` является подтипом переданного аргумента. Передать в дженерик все равно можно любой аргумент, но хотя бы возвращаемым значением вы можете просигнализировать, что такой аргумент не принимается.
  >
  > Касаемо `any` - почему я советую стараться его избегать даже в границах для типов: это из-за, например, подобного поведения. Это в принципе единственный тип, который на подобные проверки `extends` может выдать оба варианта - это нередко может приводить ко всякому неинтуитивному поведению. Это не значит, что использовать его совсем нельзя, но лучше приберечь для случаев, когда ничего другого реально не работает.
  >
  > **SHOW CODE SNIPPET - `MoreOnGenerics > Infer`**
  >
  > Ну и тогда уж к слову быстро раскажу про такую штуку как `infer`. Работая в тандеме с `extends` позволяет вытащить информацию о типе, который мы проверяем. Например, можно вытащить первый символ из строки или получить значение, которая возвращает функция. У Тайпскрипта есть встроенный тип `ReturnType` и он именно засчет этого и работает.
  >
  > **SHOW CODE SNIPPET - `MoreOnGenerics > Distributivity`**
  >
  > Еще также стоит упомянуть при дистрибьютивность. Вот у нас есть дженерик, который говорит нам является тип числом или нет. Вроде работает верно, но на третьем примере выдает `boolean` - почему? Когда Тайпскрипт видит такое условие через `extends` применяемое к объединению типов - он проводит проверку для каждого члена объединения отдельно, а не вместе. Таким образом сначала он проверяет `number` и возвращает `true`, а после проверяет `string` и возвращает `false` - а по итогу получается `true | false`, ну то есть `boolean`. Иногда это бывает полезно - допустим, мы хотим чтобы дженерик для создания массивов, нам вернул тип, который либо массив только из чисел, либо только из строк, а не массив из строк или чисел. Вот тогда можно вручную заставить дистрибьютивность работать таким вот приемом.
  > Что насчет обратных случаев, когда мы хотим ее отключить? Ну надо просто превратить наше объединение типов в один тип - например, вот так. Наш тупль сам по себе объиднением не является и проверка делается на него целиком и теперь наш дженерик `IsNumber` работает корректно.
  - functions
  <!-- TODO - DO I REALLY NEED THIS (END) -->
- Branded types **Maybe this one isn't that important - I wanna focus on applicative/abstract parts**
  - Result type
  - type-level only branding