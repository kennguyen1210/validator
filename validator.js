// Đối tượng validator
function Validator(options) {
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }

  var selectorRules = {};

  // ham thuc hien validate
  function validate(inputElement, rule) {
    // var errorElement = getParent(inputElement,'.form-group')
    var errorMessage;
    var errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorMessages);
    // lay ra cac rules cua selector
    var rules = selectorRules[rule.selector];

    // lap qua tung rules va kiem tra
    // Neu co loi thi dung viec kiem tra
    for (var i = 0; i < rules.length; ++i) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessage = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessage = rules[i](inputElement.value);
      }

      if (errorMessage) break;
    }
    if (errorMessage) {
      errorElement.innerText = errorMessage;
      inputElement.classList.add("is-invalid");
      errorElement.classList.add("invalid-feedback");
    } else {
      errorElement.innerText = "";
      inputElement.classList.remove("is-invalid");
      inputElement.classList.add("is-valid");
      errorElement.classList.remove("invalid-feedback");
      errorElement.classList.add("valid-feedback");
    }

    return !errorMessage;
  }

  // lay element cau form can validate
  var formElement = document.querySelector(options.form);

  if (formElement) {
    // khi submit form
    formElement.onsubmit = function (e) {
      e.preventDefault();

      var isFormValid = true;
      // thuc hien lap qua tung rule va validate
      options.rules.forEach(function (rule) {
        var inputElement = formElement.querySelector(rule.selector);
        var isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = false;
        }
      });

      if (isFormValid) {
        // Truong hop submit voi javascript
        if (typeof options.onSubmit === "function") {
          var enableInputs = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          console.log(enableInputs);
          var formValues = Array.from(enableInputs).reduce(function (
            values,
            input
          ) {
            switch (input.type) {
              case "checkbox":
                if (!input.matches(":checked")) {
                  values[input.name] = "";
                  return values;
                }
                if (!Array.isArray(values[input.name])) {
                  values[input.name] = [];
                }
                values[input.name].push(input.value);
                break;
              case "radio":
                values[input.name] = formElement.querySelector(
                  'input[name="' + input.name + '"]:checked'
                ).value;

                break;
              case "file":
                values[input.name] = input.files;
                break;
              default:
                values[input.name] = input.value;
            }

            return values;
          },
          {});
          options.onSubmit({ formValues });
        } else {
          formElement.submit();
        }
      }
    };

    // Lap qua moi rule va xu ly ( lang nghe su kien)
    options.rules.forEach(function (rule) {
      //Luu lai cac rules cho moi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      var inputElements = formElement.querySelectorAll(rule.selector);

      Array.from(inputElements).forEach(function (inputElement) {
        if (inputElement) {
          // Xu ly truong hop blur
          inputElement.onblur = function () {
            validate(inputElement, rule);
          };
          // Xu ly moi khi nguoi dung nhap vao input
          inputElement.oninput = function () {
            var errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorMessages);
            errorElement.innerText = "";
            inputElement.classList.remove("is-invalid");
            errorElement.classList.remove("invalid-feedback");
          };
          // Xu ly onchange
          inputElement.onchange = function () {
            validate(inputElement, rule);
          };
        }
      });
    });
  }
}
var listCatalog = localStorage.getItem("cataloglist")
  ? JSON.parse(localStorage.getItem("cataloglist"))
  : [];

// hàm lấy catalog theo Id
function getCatalogById(catalogId) {
  for (let i = 0; i < listCatalog.length; i++) {
    if (listCatalog[i].catalogId == catalogId) {
      return i;
    }
  }
  return -1;
}
// Định nghĩa các rules
// Nguyên tắc của rules
//1. Khi có lỗi trả ra message lỗi,
// 2. Khi không có lỗi trả về undefined
Validator.isRequired = function (selector, message) {
  return {
    selector: selector,
    test: function (value) {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};
Validator.minLength = function (selector, min, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập Catalog Id có ít nhất ${min} ký tự`;
    },
  };
};
Validator.catalogIdValid = function (selector, firstLetter, message) {
  return {
    selector: selector,
    test: function (value) {
      return value.startsWith(firstLetter)
        ? undefined
        : message || "Catalog Id phải bắt đầu bằng A";
    },
  };
};
Validator.checkExist = function (selector, checkEdit, dataList, message) {
  return {
    selector: selector,
    test: function (value) {
      if (checkEdit) {
        return undefined;
      }
      var index;
      for (let i = 0; i < dataList.length; i++) {
        if (dataList[i].catalogId == value) {
          index = i;
          break;
        }
      }
      index = -1;
      return index < 0
        ? undefined
        : message || "Catalog này đã tồn tại vui lòng nhập catalog mới";
    },
  };
};
// Validator.isConfirmed = function (selector, getConfirmValue, message) {
//   return {
//     selector: selector,
//     test: function (value) {
//       return value === getConfirmValue()
//         ? undefined
//         : message || "Giá trị nhập vào chưa đúng";
//     },
//   };
// };
